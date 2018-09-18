const cmd = require('node-cmd');
const fs = require('fs');
const moment = require('moment');
const path = require('path')
const {convertConfigFile, validateConfigFile} = require('./utils/helpers')
const {getUserList} = require('./utils/google')

//  Set the path of the project folder base on whether it is executed with nodejs or as an executable
let project_folder;
if(process.pkg){
    //  It is executed with .exe
    project_folder = path.dirname(process.execPath)
    
}else{
    //  It is executed with nodejs
    project_folder = __dirname 
}

//  Get values of configuration file

let config
try {
    config = convertConfigFile(path.join(project_folder, 'config', 'config.json'))
    config = validateConfigFile(config)
} catch (error) {
    console.log(`Error al cargar archivo de configuración. \n${error}`);
    process.exit(1)
}

const {DATABASE_OPTIONS} = config;

//  Database configuration
const {DB} = require('./utils/db')
DATABASE_OPTIONS.options.database = 'HERMOSILLO_USER_LOG'
const database = new DB(DATABASE_OPTIONS)

const format_user_log_data = input_data => {
    const QUSER_COLUMS = {
        USERNAME: 0,
        SESSIONNAME: 1,
        ID: 2,
        STATE: 3,
        IDLE_TIME: 4,
        LOGON_TIME_DATE: 5,
        LOGON_TIME_HOUR: 6,
        LOGON_TIME_AMPM: 7
    }

    //  Toma como entrada un archivo de texto generado por el comando 'quser'.
    //  Transforma la informacion en un arreglo de objetos para manipular la informacion mas facil.

    //  Convierte el archivo de texto en un arreglo de cadenas. Cada cadena corresponde a un renglon del archivo de texto
    let input_data_lines = input_data.split('\r\n')
    
    //  Elimina la primera linea que corresponde al encabezado del archivo (USERNAME, SESSIONAME ....)
    input_data_lines.shift();
    
    //  Elimina la ultima linea que es un elemento vacio
    input_data_lines.pop();

    //  Convierte cada linea de texto en un objeto. (Se genera un arreglo de objetos)
    let user_logs = input_data_lines.map( idl => {
        //  Convierte en arreglo y elimina los elementos vacios que se generan por espacios largos entre la informacion(julio   active)
        let user_log_array = idl.split(' ').filter(item => item.length > 0)

        //  Convierte el arreglo en un objeto
        user_log = {
            username: user_log_array[QUSER_COLUMS.USERNAME].replace('>',''), // Elimina el caracter que usa para mostrar el usuario que ejecuta el comando
            state: user_log_array[QUSER_COLUMS.STATE],
            idle_time: isNaN(user_log_array[QUSER_COLUMS.IDLE_TIME]) ? 0 :parseInt(user_log_array[QUSER_COLUMS.IDLE_TIME])
            // date: user_log_array[QUSER_COLUMS.LOGON_TIME_DATE],
            // hour: user_log_array[QUSER_COLUMS.LOGON_TIME_HOUR],
            // ampm: user_log_array[QUSER_COLUMS.LOGON_TIME_AMPM]
        }

        return user_log

    })
    return user_logs
}

const prepare_user_logs = (rows, roles) => {
    //  Prepara los registros de acuerdo a la tabla en la base de datos.
    return rows.map(row => ({
        username: row.username,
        role: !!roles[row.username] ? roles[row.username] : 'indefinido',
        date: moment().format('YYYY-MM-DD HH:mm')
    }))
}

//  Updates the user role list
const user_role_file = path.join(project_folder, 'config', 'user_role.json');
getUserList(config.GOOGLE_OPTIONS).then(result => {

    fs.writeFileSync(user_role_file, JSON.stringify(result, null, 2))
    return Promise.resolve(result)
}).catch(e => {
    //  If it fails take the values that are stored in the file.
    console.log(e);
    
    const user_role = convertConfigFile(user_role_file)
    return Promise.resolve(user_role)
    
}).then(user_role => {

    //  Get users that are connected with QUSER

    cmd.get(
        'quser',
        function(err, userdata, stderr){
            
            let user_logs = format_user_log_data(userdata)

            //  Elimina usarios inactivos
            user_logs = user_logs.filter(user => user.state == 'Active' && user.idle_time < 60)
            
            //  Prepara registros para insertar a base de datos
            user_logs = prepare_user_logs(user_logs, user_role)

            if(user_logs.length > 0 ){
                //  Escribe los registros en la base de datos
                database.write_user_logs(user_logs).then(r => {
                    console.log('Logs guardados exitosamente.');
                    
                })
            }else{
                console.log('No hay usuarios conectados.');
                
            }   
        }
    );
})





