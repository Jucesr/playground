const path = require('path')
const fs = require('fs')
const Cryptr = require('cryptr');
 
const {
    create_task, 
    remove_task, 
    convertConfigFile,
    validateConfigFile,
    makeQuestion,
    isYes
} = require('./utils/helpers')


//  ------------------------------------------------------------------------------------------------------
//  Set the path of the project folder base on whether it is executed with nodejs or as an executable
//  ------------------------------------------------------------------------------------------------------

let project_folder;
if(process.pkg){
    //  It is executed with .exe
    project_folder = path.dirname(process.execPath)
    
}else{
    //  It is executed with nodejs
    project_folder = path.join(__dirname, '..', 'build') 
}

//  ------------------------------------------------------------------------------------------------------
//  Create configuration file (config.json)
//  ------------------------------------------------------------------------------------------------------
const config_file = path.join(project_folder, 'config', 'config.json')
//  This file should have a key for encryption.
const secret = convertConfigFile(path.join(project_folder, 'config', 'secret.json'))

console.log('Has iniciado el programa.\nA continuaci\u00F3n deberas llenar los datos de configuraci\u00F3n.');

//  Verify if the is already a config file.
let useit;

if(fs.existsSync(config_file)){
    let answer = makeQuestion('Se ha detectado un archivo de configuraci\u00F3n, desea usarlo?(S/N): ')
    useit = isYes(answer)
}else{
    useit = false
    //Answer the questions
}

try {

    if(!useit){
        console.log('Si desconoce algun valor precione enter para ignorarlo, despues modifique el archivo directamente.\n\n');
        
        //  Make the questions.
        let server_name = makeQuestion('Nombre del servidor: ')
        let run_every = makeQuestion('Cada cuando generar reporte (Ejemplos "1 week", "3 day", "6 month"): ')
        let include_weekend = makeQuestion('Incluir fines de semana?(S/N): ')
        let sender_email = makeQuestion('Ingrese el correo que se usar\u00E1 para enviar los reportes (sender): ')
        let sender_password = makeQuestion('Ingrese la contraseña (sender): ')
        let receiver_email = makeQuestion('Ingrese la lista de correos que recibir\u00E1n el reporte separados por coma sin espacios (Ejemplos "diego@hotmail.com,otro@gmail.com"): ')
        console.log('\n-------------------Datos de administrador-------------------------\n');
        console.log('A continuaci\u00F3n deber\u00E1 proporcionar los datos de administrador. Los datos seran encryptados y usados para crear las tareas de windows.');
        let admin_domain = makeQuestion('Ingrese el dominio del usuario: ')
        let admin_user = makeQuestion('Ingrese el usuario: ')
        let admin_password = makeQuestion('Ingrese la contraseña: ')
        console.log('\n-------------------Datos de la base de datos-------------------------\n');
        console.log('A continuaci\u00F3n deber\u00E1 proporcionar los datos de la base de datos. Los datos seran encryptados y usados para modificar la base de datos SQL.');
        let db_server = makeQuestion('Ingrese el servidor de base de datos: ')
        let shouldUseAdmin = makeQuestion('Desea usar los mismos datos de administrador para la autentificación? (S/N): ')
        let db_user, db_password
        if(!isYes(shouldUseAdmin)){
            db_user = makeQuestion('Ingrese el usuario: ')
            db_password = makeQuestion('Ingrese la contraseña: ')
        }else{
            db_user = admin_user
            db_password = admin_password
        }
    
        try {
            run_every = run_every.split(' ')
            run_every[0] = parseInt(run_every[0]) 
        } catch (error) {
            throw "Error al capturar frecuencia del reporte. Porfavor incluir solo un número y una palabra."
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
            CHART_COLOR_SERIES: {
                "Presupuestos": "#7bc0f7",
                "Compras": "#3b8ad9",
                "Director": "#f18226",
                "Obra": "#fbbf00",
                "Administrator": "#61737b",
                "default": "black"
            },
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
        
        console.log('Archivo de configuraci\u00F3n creado correctamente. \n\n');
        
    }else{
        //  Use the fie.
    }
    
} catch (error) {
    console.log(error);
    
}

//  ------------------------------------------------------------------------------------------------------
//  Load configuration file (config.json)
//  ------------------------------------------------------------------------------------------------------
    
let config
try {
    config = convertConfigFile(path.join(project_folder, 'config', 'config.json'))
    config = validateConfigFile(config, secret.ENCRYPT_KEY)
} catch (error) {
    console.log(`Error al cargar archivo de configuraci\u00F3n. \n${error}`);
    process.exit(1)
}

const {
    RUN_EVERY,
    DATABASE_OPTIONS,
    WINDOWS_OPTIONS
} = config;


//  ------------------------------------------------------------------------------------------------------
//  Create database
//  ------------------------------------------------------------------------------------------------------
const {DB} = require('./utils/db')
const database = new DB(DATABASE_OPTIONS)

//  Get the queries
let query_checkifExist = fs.readFileSync(path.join(project_folder, 'queries', 'checkifExists.sql')).toString();
let query_createDB = fs.readFileSync(path.join(project_folder, 'queries', 'createDB.sql')).toString();
let query_createTable = fs.readFileSync(path.join(project_folder, 'queries','createTable.sql')).toString();
let query_createUser = fs.readFileSync(path.join(project_folder, 'queries', 'createUser.sql')).toString();

console.log('Verificando si la base de datos existe.');

database.executeQuery(query_checkifExist).then(r => {
    const doesItExist = r.rows[0][0];
    
    return new Promise((resolve, reject) => {
        if(doesItExist == 0){
            console.log('La base de datos no fue encontrada. Creando base de datos...');
    
            database.executeQuery(query_createDB).then(r => {
                console.log('Base de datos creada exitosamente.'); 
                return database.executeQuery(query_createTable)
            }).then(r => {
                console.log('Tabla creada exitosamente.');
                resolve()
            }).catch(e => {
                reject('No ha sido posible ejectutar configuracion SQL. Porfavor asegurese de usar los datos de adminstrador en el archivo de configuraci\u00F3n. \n\n', e);
            })
            
        }else{
            console.log('La base de datos ya existe.');
            resolve()
        }
    })
}).then(r => {
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
            program_to_run: 'save_logs.exe'
        })

        //  Creates the task to generate the report
        let p2 = create_task({
            username: WINDOWS_OPTIONS.username,
            password: WINDOWS_OPTIONS.password,
            task_name: 'Hermosillo_generate_report',
            frequency: report_frequency,
            modifier: report_modifier,
            project_folder: project_folder,
            program_to_run: 'generate_report.exe'
        }) 

        return Promise.all([p1, p2])

    }).then(r => {
        console.log('Las tareas fueron creadas exitosamente.');
        
    }).catch(e => console.log(e))
    
}).catch(e => {
    console.log(e);
    
})






