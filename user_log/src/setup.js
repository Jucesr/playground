const path = require('path')
const fs = require('fs')
const Cryptr = require('cryptr');
const moment = require('moment')
moment.locale('ES');

const {DB} = require('./utils/db')
const {Email} = require('./utils/email')
const {
    create_task, 
    remove_task, 
    parseJsonFile,
    validateConfigObject,
    encryptConfigObject,
    decryptConfigObject,
    makeQuestion,
    isYes,
    isEmail,
    getProjectFolder,
    getDaysToTakeUpTo,
    verify_windows_credentials,
    clearScreen
} = require('./utils/helpers')

function readGeneralData() {
    console.log('\n-------------------Datos de generales-------------------------\n');
    //  Make the questions.
    let server_name = makeQuestion({
        message: 'Nombre del servidor (portada del reporte): '
    })

    let run_every = makeQuestion({
        message: '¿Cada cuando desea recibir a su correo el reporte? \n(Ejemplos "1 week", "3 day", "6 month"): ',
        validation: (value) => {
            value = value.split(' ')
            if(value.length != 2) {
                throw ("Por favor incluir solo un número y una palabra.")    
            }
            value[0] = parseInt(value[0]) 
            if(isNaN(value[0])){
                throw ("El primer parámetro debe ser un número.")
            }
           
            
            if(!value[1].match('^day$|^week$|^month$')){                
                throw `Los posibles valores para el intervalo son (day, week, month).`
            }

        }
    })

    run_every = run_every.split(' ')
    run_every[0] = parseInt(run_every[0])

    let include_weekend = makeQuestion({
        message: '¿Desea incluir fines de semana? (S/N): '
    })

    return {
        server_name,
        run_every,
        include_weekend
    }
}

async function readEmailData() {
    let isInvalid = true
    let sender_email, sender_password, receiver_email
    while (isInvalid) {
        console.log('\n-------------------Datos de correo-------------------------\n');
        sender_email = makeQuestion({
            message: 'Ingrese el correo que se usará para enviar los reportes (sender): ',
            validation: (value) => {
                if(!isEmail(value)){
                    throw 'Correo inválido.'
                }
            }
        })
        sender_password = makeQuestion({
            message: 'Ingrese la contraseña (sender): ',
            isPassword: true
        })

        console.log('Valiando correo......');
        
        try{
            await new Email({
                sender_email,
                sender_password,
                receiver_email: 'donotexist@hotmailcom'
            }).sendMail({
                subject: `Test`,
                html: `Test`,
            })

            receiver_email = makeQuestion({
                message: 'Ingrese la lista de correos que recibir\u00E1n el reporte separados por coma y sin espacios. \n(Ejemplos "diego@hotmail.com,otro@gmail.com"): ',
                validation: (value) => {
                    let list_of_mails = value.split(',')
                    list_of_mails.forEach(mail => {
                        if(!isEmail(mail)){
                            throw `${mail} no es un correo electrónico válido.`
                        }
                    })
                }
            })

            isInvalid = false
            
        }catch(error){
            clearScreen()
            console.log('Error: Correo o contraseña inválido')
            
            isInvalid = true
        }
        
         
    }

    return {
        sender_email,
        sender_password,
        receiver_email
    }
    
}

async function readAdminData() {

    let isInvalid = true
    let admin_domain, admin_user, admin_password
    while (isInvalid) {
        console.log('\n-------------------Datos de administrador-------------------------\n');
        console.log('\nA continuación, deberá proporcionar los datos de administrador. Los datos serán encriptados y usados para crear las tareas de Windows.\n');
        admin_domain = makeQuestion({
            message: 'Ingrese el dominio: : ',
            allowNull: true
        })

        admin_user = makeQuestion({
            message: 'Ingrese el usuario: '
        })

    
        admin_password = makeQuestion({
            message: 'Ingrese la contraseña: ',
            isPassword: true
        })
        
        console.log('Valiando usuario......');

        try{
            await verify_windows_credentials(admin_user, admin_password)
            isInvalid = false
        }catch(error){
            clearScreen()
            console.log(`Error: ${error}`)
            isInvalid = true
        }
        
    }

    return {
        admin_domain,
        admin_user,
        admin_password
    }
    
    
}

async function readDBData(admin_domain, admin_user, admin_password) {

    let isInvalid = true
    let db_server, db_user, db_password
    while (isInvalid) {
        console.log('\n-------------------Datos de la base de datos-------------------------\n');
        console.log('\nA continuación, deberá proporcionar credenciales con permiso de administrador en el servidor de base de datos. Los datos serán encriptados y usados para crear una base de datos SQL.\n');
        
        db_server = makeQuestion({
            message: 'Ingrese nombre del servidor : '
        })
        
        let shouldUseAdmin = makeQuestion({
            message: '¿Desea usar los mismos datos de administrador para la autentificación? (S/N): '
        })
        db_user, db_password
        if(!isYes(shouldUseAdmin)){
            db_user = makeQuestion({
                message: 'Ingrese el usuario: '
            })
            db_password = makeQuestion({
                message: 'Ingrese la contraseña: ',
                isPassword: true
            })
        }else{
            db_user = admin_user
            db_password = admin_password
        }

        try {
            await new DB({
                userName: db_user,
                domain: admin_domain,
                password: db_password,
                server: db_server,
                options: {
                    database: "master",
                    encrypt: false,
                    connectionTimeout: 60000,
                    requestTimeout: 60000
                }
            }).checkConnection()

            isInvalid = false
        } catch (error) {
            
            clearScreen()
            console.log(`Error: ${error}`)
            isInvalid = true
        }
    }

    return {
        db_server,
        db_user,
        db_password
    }
}

async function createConfigurationFile(path, secret, cryptr) {

    let isConfigFileCorrect = false
    let config_object

    while (!isConfigFileCorrect) {

        try {
            
            console.log('A continuación deberá proporcionar los datos de configuración.');
    
            let {server_name, run_every, include_weekend} = readGeneralData()

            clearScreen();

            let {sender_email, sender_password, receiver_email} = await readEmailData()

            clearScreen();
            
            let {admin_domain, admin_user, admin_password} = await readAdminData()

            clearScreen();
            
            let {db_server, db_user, db_password} = await readDBData(admin_domain, admin_user, admin_password)

            config_object = {
                SERVER_NAME: server_name,
                RUN_EVERY: run_every,
                DAYLY_REPORT_START_HOUR: 8,
                DAYLY_REPORT_END_HOUR: 18,
                INCLUDE_WEEKENDS: isYes(include_weekend),
                GENERATE_REPORT_WHEN_RUN: true,
                SHOULD_SEND_EMAIL: true,
                SHOULD_GENERATE_PDF: true,
                EMAIL_OPTIONS: {
                    sender_email:  sender_email,
                    sender_password: sender_password,
                    receiver_email:  receiver_email
                },
                DATABASE_OPTIONS: {
                    userName: db_user,
                    domain: admin_domain,
                    password: db_password,
                    server: db_server,
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
                    username: admin_user,
                    password: admin_password,
                    domain:  admin_domain
                }
            }
            

            // Validate, encrypt and save config object
            
            config_object = saveConfigObject(path, config_object, cryptr)

            console.log('\nArchivo de configuración creado correctamente.\n');


            isConfigFileCorrect = true  
        } catch (error) {
            clearScreen()
            console.log(`\n[ERROR]: ${error}\n`);
        }
    }

    return config_object       
}

async function createDatabase(project_folder, database ) {
     
    //  Get the queries
    let query_checkifExist = fs.readFileSync(path.join(project_folder, 'queries', 'checkifExists.sql')).toString();
    let query_createDB = fs.readFileSync(path.join(project_folder, 'queries', 'createDB.sql')).toString();
    let query_createTable = fs.readFileSync(path.join(project_folder, 'queries','createTable.sql')).toString();
    
    console.log('Verificando base de datos....');
    
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

async function createSaveLogsTask(project_folder, WINDOWS_OPTIONS) {

    //  Removes previous taks
    await remove_task('Hermosillo_save_logs')

    await create_task({
        username: WINDOWS_OPTIONS.username,
        password: WINDOWS_OPTIONS.password,
        task_name: 'Hermosillo_save_logs',
        frequency: 'MINUTE',
        modifier: '3',
        project_folder: path.join(project_folder),
        program_to_run: `save_logs${process.pkg ? '.exe': '.js'}`
    })
}

async function createGenerateReportTask(project_folder, RUN_EVERY, WINDOWS_OPTIONS) {

   //  Get the frequency for the task that will generate the report.
    let report_frequency = RUN_EVERY[1]
    let report_modifier = RUN_EVERY[0]

    switch (report_frequency) {
        case "day": report_frequency = "DAILY"; break;
        case "week": report_frequency = "WEEKLY"; break;
        case "month": report_frequency = "MONTHLY"; break;
    }

    //  Removes previous taks
    
    await remove_task('Hermosillo_generate_report')
    
    console.log('\nProgramando tarea....');
    
    //  Creates the task to generate the report
    await create_task({
        username: WINDOWS_OPTIONS.username,
        password: WINDOWS_OPTIONS.password,
        task_name: 'Hermosillo_generate_report',
        frequency: report_frequency,
        modifier: report_modifier,
        project_folder: project_folder,
        program_to_run: `generate_report${process.pkg ? '.exe': '.js'}`
    }) 

    console.log('\nLas tarea fue creada exitosamente.');
    //  Enviar mail
    let days = getDaysToTakeUpTo(RUN_EVERY[0], RUN_EVERY[1])
    const today = moment().format()
    let target_day = moment(today).add(days, 'days').format('DD [de] MMMM')

    console.log(`\nRecibirás el primer reporte el dia ${target_day}.`);  
}

function saveConfigObject(path, config, cryptr) {
    validateConfigObject(config)
    let configEncrypt = JSON.parse(JSON.stringify(config))
    configEncrypt = encryptConfigObject(configEncrypt, cryptr)
    fs.writeFileSync(path, JSON.stringify(configEncrypt, null, 2))    

    return config
}

async function main(params) {
    
    //  ------------------------------------------------------------------------------------------------------
    //  Get the path of the project folder base on whether it is executed with nodejs or as an executable
    //  ------------------------------------------------------------------------------------------------------
    const project_folder = getProjectFolder();
    
    //  Load secret files
    const secret = parseJsonFile(path.join(project_folder, 'config', 'secret.json'))
    const cryptr = new Cryptr(secret.ENCRYPT_KEY);
    const config_file = path.join(project_folder, 'config', 'config.json')
    
    
    clearScreen()
    console.log('Has iniciado el programa "Hermosillo User Log".');

    //  ------------------------------------------------------------------------------------------------------
    //  Verify if the is already a config file.
    //  ------------------------------------------------------------------------------------------------------
    let config

    console.log('\nValidando archivo de configuración.\n');
    
    if(!fs.existsSync(config_file)){
        //  First time it runs the program.
        console.log('\nNo se ha detectado archivo de configuración.');
        config = await createConfigurationFile(config_file, secret, cryptr)

    }else{
        //  It exists already load configuration file (config.json)
        try {
            config = parseJsonFile(config_file)
            config = decryptConfigObject(config, cryptr)
            validateConfigObject(config)

        } catch (error) {
            //  Read data again
            clearScreen()
            console.log(`\n[ERROR]: ${error}\n`);
            config = await createConfigurationFile(config_file, secret, cryptr)
        }
    }    
    const {
        DATABASE_OPTIONS,
        WINDOWS_OPTIONS
    } = config;
        
    //  ------------------------------------------------------------------------------------------------------
    //  Create database
    //  ------------------------------------------------------------------------------------------------------
    
    const database = new DB(DATABASE_OPTIONS)
   
    await createDatabase(project_folder, database)

    //  ------------------------------------------------------------------------------------------------------
    //  Create task "save_logs"
    //  ------------------------------------------------------------------------------------------------------

    await createSaveLogsTask(project_folder, WINDOWS_OPTIONS)

    //  ------------------------------------------------------------------------------------------------------
    //  Display menu
    //  ------------------------------------------------------------------------------------------------------
    let opc = 0
    while (opc != 8) {
        clearScreen()
        console.log('\n------Menu de opciones------\n');
        console.log('[1] Programar envio de reporte.');
        console.log('[2] Eliminar programación de reporte.');
        console.log('[3] Modificar parámetros de correo.');
        console.log('[4] Modificar parámetros de base de datos.');
        console.log('[5] Modificar parámetros de Windows.');
        console.log('[6] Información general.');
        console.log('[7] Desinstalar.');
        console.log('[8] Salir.');
        opc = makeQuestion({
            message: 'Ingrese una opcion: '
        })

        clearScreen()

        switch (opc) {
            case '1':
                let shouldAsk = makeQuestion({
                    message: '¿Desea usar los datos del archivo de configuracion?: (S/N) '
                })
                
                if(!isYes(shouldAsk)){

                    let {server_name, run_every, include_weekend} = await readGeneralData()
                    config.SERVER_NAME = server_name
                    config.RUN_EVERY = run_every
                    config.INCLUDE_WEEKENDS = isYes(include_weekend)

                    saveConfigObject(config_file, config, cryptr)
                }

                await createGenerateReportTask(project_folder, config.RUN_EVERY, WINDOWS_OPTIONS)


            break;

            case '2':
                await remove_task('Hermosillo_generate_report')
                console.log('No recibirás mas correos con el reporte');
                
            break;

            case '3':
                let {sender_email, sender_password, receiver_email} = await readEmailData()
                config.EMAIL_OPTIONS.sender_email = sender_email
                config.EMAIL_OPTIONS.sender_password = sender_password
                config.EMAIL_OPTIONS.receiver_email = receiver_email

                saveConfigObject(config_file, config, cryptr)

                console.log('Se han actualizado los parámetros de correo.');
                
            break;

            case '4':
                let {db_server, db_user, db_password} = await readDBData(config.WINDOWS_OPTIONS.admin_domain, config.WINDOWS_OPTIONSadmin_user, config.WINDOWS_OPTIONSadmin_password)
                config.DATABASE_OPTIONS.db_server = db_server
                config.DATABASE_OPTIONS.db_user = db_user
                config.DATABASE_OPTIONS.db_password = db_password

                saveConfigObject(config_file, config, cryptr)

                console.log('Se han actualizado los parámetros de base de datos.');
                
            break;

            case '5':
                let {admin_domain, admin_user, admin_password} = await readAdminData()
                
                config.WINDOWS_OPTIONS.admin_domain = admin_domain
                config.WINDOWS_OPTIONS.admin_user = admin_user
                config.WINDOWS_OPTIONS.admin_password = admin_password

                saveConfigObject(config_file, config, cryptr)

                console.log('Se han actualizado los parámetros de Windows.');
                
            break;

            case '6':
                console.log('\n-----Información general-----\n');
                let {SERVER_NAME, RUN_EVERY, INCLUDE_WEEKENDS} = config
                console.log(`Nombre del servidor: ${SERVER_NAME}`);
                let f;
                switch (RUN_EVERY[1]) {
                    case 'week': f = 'semana'; break;
                    case 'day': f = 'día'; break;
                    case 'month': f = 'mes'; break;
                }
                console.log(`Recibirá el reporte cada ${RUN_EVERY[0]} ${f}`);
                console.log(`Incluir fines de semana?: ${INCLUDE_WEEKENDS}`);
                

                console.log('\n-----Parámetros de correo-----\n');

                let {sender_email: se, receiver_email: re} = config.EMAIL_OPTIONS
                console.log(`Actualmente se usa ${se} para enviar correos (sender)`);
                console.log(`Lista de correos que reciben el reporte ${re.split(',')}`);

                console.log('\n-----Parámetros de base de datos-----\n');

                let {userName: dbun, server: dbs} = config.DATABASE_OPTIONS
                console.log(`Nombre del servidor: ${dbs}`);
                console.log(`Nombre de usuario: ${dbun}`);
                
                console.log('\n-----Parámetros de Windows-----\n');

                let {username: wun, domain: wd} = config.WINDOWS_OPTIONS
                console.log(`Dominio: ${wd}`);
                console.log(`Nombre de usuario: ${wun}`);

            break;
            default:
                break;
        }
        console.log('');
        
        makeQuestion({
            message: 'Preciona la tecla Enter para continuar...',
            allowNull: true
        })
    }
    





    //await createTasks(project_folder, RUN_EVERY, new Email(EMAIL_OPTIONS), WINDOWS_OPTIONS)

}

main().then(r => {
    console.log('Hasta pronto.');
    
}).catch(e => {
    console.log(`[Error]: ${e}`)
    process.exit(1)
});








