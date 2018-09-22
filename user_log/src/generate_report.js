const moment = require('moment')
const path = require('path')
const uniq = require('lodash/uniq')
const Cryptr = require('cryptr')

moment.locale('ES');
moment.defaultFormat = "YYYY-MM-DD"

const {
    create_column_chart,
    create_bar_chart
} = require('./utils/chart')

const {
    replaceAll, 
    getDaysToTakeUpTo, 
    isWeekEnd, 
    parseJsonFile,
    validateConfigObject,
    createThreeDirectory,
    decryptConfigObject,
    getProjectFolder
} = require('./utils/helpers')

const {generatePDF} = require('./utils/pdf')

const project_folder = getProjectFolder();

//  ------------------------------------------------------------------------------------------------------
//  Load configuration file (config.json)
//  ------------------------------------------------------------------------------------------------------

let config
const secret = parseJsonFile(path.join(project_folder, 'config', 'secret.json'))
const cryptr = new Cryptr(secret.ENCRYPT_KEY);
try {
    config = parseJsonFile(path.join(project_folder, 'config', 'config.json'))
    config = decryptConfigObject(config, cryptr)
    validateConfigObject(config)

} catch (error) {
    console.log(`Error al cargar archivo de configuración. \n${error}`);
    process.exit(1)
}

const {
    RUN_EVERY,
    DAYLY_REPORT_START_HOUR,
    DAYLY_REPORT_END_HOUR,
    INCLUDE_WEEKENDS,
    SERVER_NAME,
    SHOULD_SEND_EMAIL,
    SHOULD_GENERATE_PDF,
    DATABASE_OPTIONS,
    EMAIL_OPTIONS
} = config;

//  Chart color series
const CHART_COLOR_SERIES = parseJsonFile(path.join(project_folder, 'config', 'chart_color.json'))

//  Database configuration
const {DB} = require('./utils/db')
DATABASE_OPTIONS.options.database = 'HERMOSILLO_USER_LOG'
const database = new DB(DATABASE_OPTIONS)

//  Email configuration
const {Email} = require('./utils/email')
const mailer = new Email(EMAIL_OPTIONS)

//  Functions

const generate_chart_by_hours = (current_day, total_days, folder_path) => {

    //  TODO: Remove recurse function. Not needed anymore

    //  Recurse condition. 
    let target_date = moment(today).subtract(total_days, 'days').format()
    
    if( !moment(current_day).isAfter(target_date) ){
        return 0;
    }
    
    //  Skip Weekends if necesary
    if(!INCLUDE_WEEKENDS && isWeekEnd(moment(current_day).format('dddd'))){
        return generate_chart_by_hours(moment(current_day).subtract(1, 'days').format(), total_days, folder_path)
    }

    let sd = current_day 
    let ed = moment(current_day).add(1, 'days').format()
    

    let promiseBranch = database.get_users_by_hour(sd, ed).then(results => {
        
        const x_axis_start_hour = DAYLY_REPORT_START_HOUR
        const x_axis_end_hour = DAYLY_REPORT_END_HOUR
    
        //  Converts query result into an object where each property is a ROLE.
        // {
        //     "Presupuestos": {
        //         data: {01: 1, 02: 3 ...}
        //         color: "red"
        //         ...
        //     }
        //     ...
        // }

        //  Add data property
        let data = results.rows.reduce( (current, row) => {
    
            
            let hour = row[1]
            let role = row[0]
            let value = row[2]

            //  Check if the hour is beetween the desired interval. If not skip the row.
            if( parseInt(hour) >= x_axis_start_hour && parseInt(hour) <= x_axis_end_hour){
                
                
                if(!!current[ role ]){
                    current[ role ][ hour ] = value
                }else{
                    current[ role ] = {}
                    current[ role ][ hour ] = value
                }
            } 
            
            return current
        }, {})
        
        return create_column_chart({
            title: moment(current_day).format('dddd, D MMMM'),
            filename: `${folder_path}/${current_day}`,
            data,
            color_series: CHART_COLOR_SERIES,
            x_axis_start: x_axis_start_hour,
            x_axis_end: x_axis_end_hour,
            x_axis_label: 'Horas'
        })
 
    }).then(result => {
        console.log(`Se creó ${folder_path}/${current_day}.jpeg`);
        
        return generate_chart_by_hours(moment(current_day).subtract(1, 'days').format(), total_days, folder_path)

    })
    
    return promiseBranch
          
}

const generate_chart_by_days = (start_day, total_days, filename, chart_title) => {

    let request = []
    let target_date = moment(start_day).subtract(total_days, 'days').format()
    let current_day = start_day

    //  Get all the roles in the interval

    return database.get_user_list(target_date, start_day).then( results => {
        
        let list_of_roles = results.rows.map(row => {
            return row[1]
        })

        list_of_roles = uniq(list_of_roles)
        list_of_roles.sort()


        //  Iterates from (Today - X days) to Today
        while(moment(current_day).isAfter(target_date) ){

            let sd = current_day 
            let ed = moment(current_day).add(1, 'days').format()

            //  Skip Weekends if necesary
            if( !(isWeekEnd(moment(current_day).format('dddd')) && !INCLUDE_WEEKENDS) ){
                // get user list of each day and attach day to the result
                request.push({
                    data: database.get_user_list(sd, ed),
                    day: current_day
                })
            }
    
            
            
            // Decrease 1 day
            current_day = moment(current_day).subtract(1, 'days').format()
        }
        
        //  Get all the request from the request's array
        let promises = request.map(request => request.data)
    
        //  
        return Promise.all(promises).then(results => {

            //  Format the data where each property is a role and value is number of users
            let data = results.map((result, index) => {
                
                return {
                    day: request[index].day,
                    dataset: result.rows.reduce( (current, row) => {
    
                        let role = row[1]
            
                        if(!!current[ role ]){
                            current[ role ] += 1
                        }else{
                            current[ role ] = 1
                        }
    
                        return current
                    }, {})
                }
     
            })
    
            /*  
                At this point data contains an array like this
                [
                    {
                        day: '2018-01-01',
                        dataset: {
                            "Presupuestos": 4,
                            "Compras" : 1
                            .... 
                        }
                    },
                    ....
                ]
    
                We need to convert it into something like this.
    
                [
                    ["Lunes", 1, 3, 4, 6],
                    ["Martes", 4, 0 ,1 3]
                ]
            */

            
            
    
            let chart_data = data.map(item => {
    
                let chart_series = Object.keys(item.dataset)
                let dataset = chart_series.reduce((ds, role) => {
                    
                    //  Find the role in the list of roles
                    let index = list_of_roles.indexOf(role)
                
                    //  Set the value in the array at the correct position base on the list of roles
                    ds[ index ] = item.dataset[role]
                    
                    return ds
                },[] )

                // Set 0 for empty roles
                for (let index = 0; index < dataset.length; index++) {
                    const element = dataset[index];
                    dataset[index] = !!element ? element : 0      
                }

                return [
                    moment(item.day).format( total_days > 7 ? 'D/M' : 'dddd DD'),
                ].concat(dataset)
            })

            //  Change order
            chart_data.reverse()

            //  Generate the chart

            return create_bar_chart({
                filename: filename,
                title: chart_title,
                data: chart_data,
                series: list_of_roles,
                color_series: CHART_COLOR_SERIES,
                x_axis_label: 'Dias'
            })

        }) //   End Promise.all
    }) //   End promise to get the roles
}

const generate_chart_by_months = (start_day, total_months, filename, chart_title) => {
    
    let end_date = moment(start_day).subtract(total_months, "months").format()

    start_day = moment(start_day).add(1, 'day').format()
    
    //  Get the list of roles in the inverval. In this way the system will print 0 where there are no users.
    return database.get_user_list(end_date, start_day).then( results => {
        let list_of_roles = results.rows.map(row => {
            return row[1]
        })

        list_of_roles = uniq(list_of_roles)
        list_of_roles.sort()

        //  Get all logs in the inverval
        return database.get_users_by_month(end_date, start_day).then(results => {

            let data = results.rows.reduce( (current, row) => {
    
                let month = row[1]
                let role = row[0]
                let value = row[2]
    
                if(!!current[ month ]){
                    current[ month ] [ role ] = value
                }else{
                    current[ month ] = {}
                    current[ month ] [ role ] = value
                }
                
                return current
            }, {})
    
            let chart_data = Object.keys(data).map(item => {
        
                let chart_series = Object.keys(data[item])
                
                let dataset = chart_series.reduce((ds, role) => {
                    
                    //  Find the role in the list of roles
                    let index = list_of_roles.indexOf(role)
                
                    //  Set the value in the array at the correct position base on the list of roles
                    ds[ index ] = data[item][role]
                    
                    return ds
                },[] )                
    
                // Set 0 for empty roles
                for (let index = 0; index < dataset.length; index++) {
                    const element = dataset[index];
                    dataset[index] = !!element ? element : 0      
                }
    
                return [
                    moment(item).format( 'MMM YYYY'),
                ].concat(dataset)
            })

            // console.log(chart_data);

            return create_bar_chart({
                title: chart_title,
                filename: filename,
                data: chart_data,
                x_axis_label: 'Meses',
                series: list_of_roles,
                color_series: CHART_COLOR_SERIES
            })
            
    
            
        })

    })

    
}

//  Global variables
const today = moment().format()
const take_up_to_x_previous_days = getDaysToTakeUpTo(RUN_EVERY[0], RUN_EVERY[1])

const days_folder = path.join(project_folder,'/assets','charts','days' )
const charts_folder = path.join(project_folder,'/assets','charts' )
let filename

//  -------------------------- Main --------------------------

//  Creates tree directory for assets that will be generate if they don't exist.
createThreeDirectory(`${project_folder}/assets`)

//  Generates multiples charts, one with each day that is in the range.
let p1 = generate_chart_by_hours(today, take_up_to_x_previous_days, days_folder)

//  Generates a single chart with the days of the current week.
filename = path.join(charts_folder, 'logs_of_the_week' )
let p2 = generate_chart_by_days(today, 7, filename, 'Actividad de usuarios de la semana')
 
//  Generates a single chart with the days of the current month.
filename = path.join(charts_folder, 'logs_of_the_month' )
let p3 = generate_chart_by_days(today, 31, filename, 'Actividad de usuarios del mes')

//  Generates a single chart with the months of the year.
filename = path.join(charts_folder, 'logs_of_the_year' )
let p4 = generate_chart_by_months(today, 12, filename, 'Actividad de usuarios del año')


//  Wait till all charts are generated
Promise.all([p1,p2,p3,p4]).then(results => {
    console.log('Todas las gráficas fueron creadas correctamente.');
    console.log('Generando documento PDF.....');
    
    //  Generate PDF document.
    if(SHOULD_GENERATE_PDF){
        return generatePDF({
            project_folder: project_folder, 
            filename: `${moment(today).format('YYYY_MM_DD')}`,
            serverName: SERVER_NAME,
            from: moment(today).subtract(take_up_to_x_previous_days - 1, 'days').format(),
            to: today,
            include_weekends: INCLUDE_WEEKENDS
        }) 
    }else{
        return Promise.resolve('PDF NO ha sido generado: Cambie el valor de SHOULD_GENERATE_PDF a true en el archivo de configuración para activar funcionalidad.')
    }
      
}).then(result => {
    console.log(result);
    console.log('Enviando correo....');
    
    //  Send PDF document via Email
    if(SHOULD_SEND_EMAIL){
        return mailer.sendMail({
            subject: `Reporte de actividad de usuarios servidor: ${SERVER_NAME}`,
            // html: text,
            attachments: [
                {
                    filename: 'report.pdf',
                    path: path.join(project_folder, 'assets', 'docs', `${replaceAll(today,'-','_')}.pdf`)
                }
            ]
        })
    }else{
        return Promise.resolve('El email NO ha sido enviado sent: Cambie el valor de SHOULD_SEND_EMAIL a true en el archivo de configuración para activar funcionalidad.')
    }
    
}).then(result => {
    console.log(result);
}).catch(error => {
    console.error('Un error ha ocurrido. ', error);

    mailer.sendMail({
        subject: `[ERROR] Reporte de actividad de usuarios servidor: ${SERVER_NAME}`,
        html: 'No se pudo generar PDF debido al siguiente error \n' + error.toString(),
    })
    
})













