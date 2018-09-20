const path = require('path')
const fs = require('fs')
const Cryptr = require('cryptr');
const moment = require('moment')
moment.locale('ES');
const {
    create_task, 
    remove_task, 
    convertConfigFile,
    validateConfigFile,
    makeQuestion,
    isYes,
    getProjectFolder,
    getDaysToTakeUpTo,
    verify_windows_credentials
} = require('./utils/helpers')

//  ------------------------------------------------------------------------------------------------------
//  Create configuration file (config.json)
//  ------------------------------------------------------------------------------------------------------
async function createConfigurationFile(project_folder, secret, Email) {
    
    const config_file = path.join(project_folder, 'config', 'config.json')
    
    console.log('Has iniciado el programa "Hermosillo User Log".\nA continuación deberás llenar los datos de configuración.');

    //  Verify if the is already a config file.
    let useit;

    if(fs.existsSync(config_file)){
        let answer = makeQuestion('\nSe ha detectado un archivo de configuraci\u00F3n, ¿Desea usarlo? (S/N): ')
        useit = isYes(answer)
    }else{
        useit = false
        //Answer the questions
    }

    if(!useit){
        console.log('\n-------------------Datos de generales-------------------------\n');
        //  Make the questions.
        let server_name = makeQuestion('Nombre del servidor: ')
        let run_every = makeQuestion('¿Cada cuando desea recibir a su correo el reporte? \n(Ejemplos "1 week", "3 day", "6 month"): ')
        
  
        run_every = run_every.split(' ')
        if(run_every.length != 2) {
            throw new Error("Por favor incluir solo un número y una palabra.")    
        }
        run_every[0] = parseInt(run_every[0]) 
        if(isNaN(run_every[0])){
            throw new Error("El primer parámetro debe ser un número.")
        }

        let include_weekend = makeQuestion('¿Desea incluir fines de semana? (S/N): ')
        console.log('\n-------------------Datos de correo-------------------------\n');
        let sender_email = makeQuestion('Ingrese el correo que se usará para enviar los reportes (sender): ')
        let sender_password = makeQuestion('Ingrese la contraseña (sender): ')

        console.log('Verificando correo......');
        
        await new Email({
            sender_email,
            sender_password,
            receiver_email: 'donotexist@hotmailcom'
        }).sendMail({
            subject: `Test`,
            html: `Test`,
        
        })

        let receiver_email = makeQuestion('Ingrese la lista de correos que recibir\u00E1n el reporte separados por coma y sin espacios. \n(Ejemplos "diego@hotmail.com,otro@gmail.com"): ')
        console.log('\n-------------------Datos de administrador-------------------------\n');
        console.log('A continuación, deberá proporcionar los datos de administrador. Los datos serán encriptados y usados para crear las tareas de Windows.');
        let admin_domain = makeQuestion('Ingrese el dominio: : ')
        let admin_user = makeQuestion('Ingrese el usuario: ')
        let admin_password = makeQuestion('Ingrese la contraseña: ')
        
        console.log('Verificando usuario......');
        await verify_windows_credentials(admin_user, admin_password)
 
        console.log('\n-------------------Datos de la base de datos-------------------------\n');
        console.log('A continuación, deberá proporcionar los datos de administrador. Los datos serán encriptados y usados para modificar la base de datos SQL.');
        let db_server = makeQuestion('Ingrese el servidor de base de datos: ')
        let shouldUseAdmin = makeQuestion('¿Desea usar los mismos datos de administrador para la autentificación? (S/N): ')
        let db_user, db_password
        if(!isYes(shouldUseAdmin)){
            db_user = makeQuestion('Ingrese el usuario: ')
            db_password = makeQuestion('Ingrese la contraseña: ')
        }else{
            db_user = admin_user
            db_password = admin_password
        }
    
        
        
        const cryptr = new Cryptr(secret.ENCRYPT_KEY);
    
        let config_object = {
            SERVER_NAME: server_name,
            RUN_EVERY: run_every,
            DAYLY_REPORT_START_HOUR: 8,
            DAYLY_REPORT_END_HOUR: 18,
            INCLUDE_WEEKENDS: isYes(include_weekend),
            GENERATE_REPORT_WHEN_RUN: true,
            SHOULD_SEND_EMAIL: true,
            SHOULD_GENERATE_PDF: true,
            EMAIL_OPTIONS: {
                sender_email:  cryptr.encrypt(sender_email),
                sender_password: cryptr.encrypt(sender_password),
                receiver_email:  cryptr.encrypt(receiver_email)
            },
            DATABASE_OPTIONS: {
                userName: cryptr.encrypt(db_user),
                domain: admin_domain,
                password: cryptr.encrypt(db_password),
                server: cryptr.encrypt(db_server),
                options: {
                    database: "master",
                    encrypt: false,
                    connectionTimeout: 60000,
                    requestTimeout: 60000
                }
            },
            GOOGLE_OPTIONS: {
                APIKey: secret.API_KEY,
                spreadsheet_id: secret.SPREADSHEET_ID
            },
            WINDOWS_OPTIONS: {
                username: cryptr.encrypt(admin_user),
                password: cryptr.encrypt(admin_password),
                domain:  admin_domain
            }
        }

        fs.writeFileSync(config_file, JSON.stringify(config_object, null, 2))
        
        console.log('\nArchivo de configuraci\u00F3n creado correctamente.');
        
    }

    return 1
       
}

async function createDatabase(project_folder, database ) {
     
    //  Get the queries
    let query_checkifExist = fs.readFileSync(path.join(project_folder, 'queries', 'checkifExists.sql')).toString();
    let query_createDB = fs.readFileSync(path.join(project_folder, 'queries', 'createDB.sql')).toString();
    let query_createTable = fs.readFileSync(path.join(project_folder, 'queries','createTable.sql')).toString();
    
    console.log('Verificando si la base de datos existe.');
    
    const r_database  = await database.executeQuery(query_checkifExist)

    const doesItExist = r_database.rows[0][0];
    
    if(doesItExist == 0){
        console.log('La base de datos no fue encontrada. Creando base de datos...');
        
        try{
            await database.executeQuery(query_createDB)
            console.log('Base de datos creada exitosamente.')
            await database.executeQuery(query_createTable)
            console.log('Tabla creada exitosamente.')
            return 0;
        }catch(e){
            throw new Error('No ha sido posible ejectutar configuracion SQL. Porfavor asegurese de usar los datos de administrador.')
        }
        
    }else{
        console.log('La base de datos ya existe.');
        return 0;
    }
         
}

async function createTasks(project_folder, RUN_EVERY, mailer, WINDOWS_OPTIONS) {
    //  ------------------------------------------------------------------------------------------------------
    //  Create tasks
    //  ------------------------------------------------------------------------------------------------------

    //  Get the frequency for the task that will generate the report.
    let report_frequency = RUN_EVERY[1]
    switch (report_frequency) {
        case "day": report_frequency = "DAILY"; break;
        case "week": report_frequency = "WEEKLY"; break;
        case "month": report_frequency = "MONTHLY"; break;
    }
    let report_modifier = RUN_EVERY[0]

    //  Removes previous taks
    return Promise.all([
        remove_task('Hermosillo_save_logs'),
        remove_task('Hermosillo_generate_report')
    ]).then(r => {
        console.log('Las tareas fueron eliminadas');
        console.log('Creando nuevas tareas....');
        
        //  Creates the task to save logs in the databse
        let p1 = create_task({
            username: WINDOWS_OPTIONS.username,
            password: WINDOWS_OPTIONS.password,
            task_name: 'Hermosillo_save_logs',
            frequency: 'MINUTE',
            modifier: '3',
            project_folder: path.join(project_folder),
            program_to_run: `save_logs${process.pkg ? '.exe': '.js'}`
        })

        //  Creates the task to generate the report
        let p2 = create_task({
            username: WINDOWS_OPTIONS.username,
            password: WINDOWS_OPTIONS.password,
            task_name: 'Hermosillo_generate_report',
            frequency: report_frequency,
            modifier: report_modifier,
            project_folder: project_folder,
            program_to_run: `generate_report${process.pkg ? '.exe': '.js'}`
        }) 

        return Promise.all([p1, p2])

    }).then(r => {

        console.log('Las tareas fueron creadas exitosamente.');
        console.log('Recibirás un correo confirmando que la instalación se hizo correctamente.');
        //  Enviar mail
        let days = getDaysToTakeUpTo(RUN_EVERY[0], RUN_EVERY[1])
        const today = moment().format()
        let target_day = moment(today).add(days, 'days').format('DD [de] MMMM')
        return mailer.sendMail({
            subject: `Hermosillo user log`,
            html: `La aplicación se configuró correctamente. Recibirás el primer reporte el dia <strong>${target_day}.</strong>`,
        })
    })   
}

async function main(params) {
    const {DB} = require('./utils/db')
    const {Email} = require('./utils/email')
    //  ------------------------------------------------------------------------------------------------------
    //  Get the path of the project folder base on whether it is executed with nodejs or as an executable
    //  ------------------------------------------------------------------------------------------------------
    const project_folder = getProjectFolder();
    //  This file should have a key for encryption.
    const secret = convertConfigFile(path.join(project_folder, 'config', 'secret.json'))

    await createConfigurationFile(project_folder, secret, Email)

    //  ------------------------------------------------------------------------------------------------------
    //  Load configuration file (config.json)
    //  ------------------------------------------------------------------------------------------------------
        
    let config
    try {
        config = convertConfigFile(path.join(project_folder, 'config', 'config.json'))
        config = validateConfigFile(config, secret.ENCRYPT_KEY)
    } catch (error) {
        throw new Error(`No fue posible cargar archivo de configuraci\u00F3n.\n${error}`)
    }

    const {
        RUN_EVERY,
        DATABASE_OPTIONS,
        WINDOWS_OPTIONS,
        EMAIL_OPTIONS
    } = config;
    
    //  ------------------------------------------------------------------------------------------------------
    //  Create database
    //  ------------------------------------------------------------------------------------------------------
    
    const database = new DB(DATABASE_OPTIONS)
   
    await createDatabase(project_folder, database)

    await createTasks(project_folder, RUN_EVERY, new Email(EMAIL_OPTIONS), WINDOWS_OPTIONS)

}

main().then(r => {
    console.log('Correo enviado.');
    
}).catch(e => {
    console.log(`[Error]: ${e}`)
    process.exit(1)
});





