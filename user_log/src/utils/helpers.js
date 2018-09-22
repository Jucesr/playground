const fs = require('fs')
const path = require('path')
const cmd = require('node-cmd')
const readline = require('readline-sync')
const moment = require('moment')

const replaceAll = (target, search, replacement) => {
    return target.replace(new RegExp(search, "g"), replacement)
}

const getDaysToTakeUpTo = (times, period) => {
    let day_factor ;

    switch (period) {
        case "day": day_factor = 1; break;
        case "week": day_factor = 7; break;
        case "month": day_factor = 31; break;
        case "year": day_factor = 365; break
        default: day_factor = 1; break;
    }

    return day_factor * times
}

const isWeekEnd = (day) => {
    let r = false
    switch (day) {
        case 'sábado': r = true; break;
        case 'domingo': r = true; break;
        
    }

    return r
}

const isEmail = (email) => {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

const validateConfigObject = (config) => {
    //  Check the config object has all the values and the rigth type.
    
    let required_properties = [
        {
            name: 'SERVER_NAME',
            type: 'string'    
        },
        {
            name: 'RUN_EVERY',
            type: 'object'    
        },
        {
            name: 'DAYLY_REPORT_START_HOUR',
            type: 'number'    
        },
        {
            name: 'DAYLY_REPORT_END_HOUR',
            type: 'number'    
        },
        {
            name: 'INCLUDE_WEEKENDS',
            type: 'boolean'    
        },
        {
            name: 'GENERATE_REPORT_WHEN_RUN',
            type: 'boolean'    
        },
        {
            name: 'SHOULD_SEND_EMAIL',
            type: 'boolean'    
        },
        {
            name: 'SHOULD_GENERATE_PDF',
            type: 'boolean'    
        },
        {
            name: 'EMAIL_OPTIONS',
            type: 'object'    
        },
        {
            name: 'DATABASE_OPTIONS',
            type: 'object'    
        },
        {
            name: 'GOOGLE_OPTIONS',
            type: 'object'    
        },
        {
            name: 'WINDOWS_OPTIONS',
            type: 'object'    
        }
    ]

    required_properties.forEach(rp => {
        
        if(!config.hasOwnProperty(rp.name)){
            throw `El archivo no contiene la propiedad ${rp.name}.`
        }else if(typeof config[rp.name] != rp.type){
            throw `La propiedad ${rp.name} debe ser del tipo ${rp.type}.`
        }
    })

    //  Check specific properties

    //  RUN_EVERY
    let re = config["RUN_EVERY"]
    if(re.length != 2){
        throw `La propiedad RUN_EVERY debe contener únicamente 2 valores.`
    }
    if(typeof re[0] != 'number'){
        throw `El primer valor de RUN_EVERY debe ser del tipo number.`
    }

    if(typeof re[1] != 'string'){
        throw `El segundo valor de RUN_EVERY debe ser del tipo string.`
    }else if(!re[1].match('^day$|^week$|^month$')){
        throw `Los posibles valores para el intervalo de RUN_EVERY son (day, week, month).`
    }

    //  DAYLY_REPORT_START_HOUR and DAYLY_REPORT_END_HOUR

    let sh = config["DAYLY_REPORT_START_HOUR"]
    let eh = config["DAYLY_REPORT_END_HOUR"]

    if(eh <= sh){
        throw "DAYLY_REPORT_END_HOUR debe ser mayor a DAYLY_REPORT_START_HOUR."
    }

    if(eh < 0){
        throw "DAYLY_REPORT_END_HOUR debe ser mayor a 0."
    }

    if(sh < 0){
        throw "DAYLY_REPORT_START_HOUR debe ser mayor a 0."
    }

    // EMAIL_OPTIONS

    let eo = config["EMAIL_OPTIONS"]
    
    if(!eo.hasOwnProperty('sender_email') || !isEmail(eo.sender_email)){
        throw "La propiedad EMAIL_OPTIONS debe contener sender_email y debe ser un correo electrónico válido."
    }
    if(!eo.hasOwnProperty('sender_password')){
        throw "La propiedad EMAIL_OPTIONS debe contener sender_password."
    }
    if(!eo.hasOwnProperty('receiver_email')){
        throw "La propiedad EMAIL_OPTIONS debe contener receiver_email y debe ser un correo electrónico válido o varios separados por coma. \nEjemplo (alguien@hotmail.com,otromas@hotmail.com)"
    }
    let list_of_mails = eo.receiver_email.split(',')
    list_of_mails.forEach(mail => {
        if(!isEmail(mail)){
            throw `${mail} no es un correo electrónico válido.`
        }
    })

    //  DATABASE_OPTIONS

    let dbo = config["DATABASE_OPTIONS"]
    let dbo_rp = ['userName', 'password', 'server', 'options']

    dbo_rp.forEach(rp => {
        if(!dbo.hasOwnProperty(rp)){
            throw `La propiedad DATABASE_OPTIONS debe contener ${rp}.`
        }
    })

    if(!dbo['options'].hasOwnProperty('database') ){
        throw "La propiedad DATABASE_OPTIONS.options debe contener database."
    }

    return true
}

const decryptConfigObject = (config, cryptr) => {

    try {
        config.EMAIL_OPTIONS = {
            sender_email: cryptr.decrypt(config.EMAIL_OPTIONS.sender_email),
            sender_password: cryptr.decrypt(config.EMAIL_OPTIONS.sender_password),
            receiver_email: cryptr.decrypt(config.EMAIL_OPTIONS.receiver_email)
        }
        
        config.DATABASE_OPTIONS = {
            userName: cryptr.decrypt(config.DATABASE_OPTIONS.userName),
            domain: config.DATABASE_OPTIONS.domain,
            password: cryptr.decrypt(config.DATABASE_OPTIONS.password),
            server: cryptr.decrypt(config.DATABASE_OPTIONS.server),
            options: config.DATABASE_OPTIONS.options
        }
        config.WINDOWS_OPTIONS = {
            username: cryptr.decrypt(config.WINDOWS_OPTIONS.username),
            password: cryptr.decrypt(config.WINDOWS_OPTIONS.password),
            domain: config.WINDOWS_OPTIONS.domain
        }  
    } catch (error) {
        throw "No fue posible desencriptar."
    }
    

    return config
}

const clearScreen = () => {
    console.log('\033[2J');
}

const encryptConfigObject = (config, cryptr) => {

    config.EMAIL_OPTIONS = {
        sender_email: cryptr.encrypt(config.EMAIL_OPTIONS.sender_email),
        sender_password: cryptr.encrypt(config.EMAIL_OPTIONS.sender_password),
        receiver_email: cryptr.encrypt(config.EMAIL_OPTIONS.receiver_email)
    }
    
    config.DATABASE_OPTIONS = {
        userName: cryptr.encrypt(config.DATABASE_OPTIONS.userName),
        domain: config.DATABASE_OPTIONS.domain,
        password: cryptr.encrypt(config.DATABASE_OPTIONS.password),
        server: cryptr.encrypt(config.DATABASE_OPTIONS.server),
        options: config.DATABASE_OPTIONS.options
    }
    config.WINDOWS_OPTIONS = {
        username: cryptr.encrypt(config.WINDOWS_OPTIONS.username),
        password: cryptr.encrypt(config.WINDOWS_OPTIONS.password),
        domain: config.WINDOWS_OPTIONS.domain
    }

    return config
}

const parseJsonFile = (path) => {
    

    let content, config
    try {
        content = fs.readFileSync(path, 'utf8')
    } catch (error) {
        throw `El archivo de configuración '${path}' no existe.`
    }

    try {
        config = JSON.parse(content)
    } catch (error) {
        throw `El archivo de configuración '${path}' tiene un formato inválido.`
    }

    return config;

}

const createThreeDirectory = (assetsPath) => {
    

    if (!fs.existsSync(assetsPath)){
        fs.mkdirSync(assetsPath)
        fs.mkdirSync(`${assetsPath}/charts`)
        fs.mkdirSync(`${assetsPath}/charts/days`)
        fs.mkdirSync(`${assetsPath}/docs`)
    }
    
    if(!fs.existsSync(`${assetsPath}/charts`)){
        fs.mkdirSync(`${assetsPath}/charts`)
        fs.mkdirSync(`${assetsPath}/charts/days`)
    }

    if(!fs.existsSync(`${assetsPath}/charts/days`)){
        fs.mkdirSync(`${assetsPath}/charts/days`)
    }

    if(!fs.existsSync(`${assetsPath}/docs`)){
        fs.mkdirSync(`${assetsPath}/docs`)
    }
}

const create_task = (params) => {

    let {
        start_date,
        days,
        task_name,
        frequency,
        project_folder,
        program_to_run,
        modifier,
        username,
        password
    } = params;

    return new Promise((resolve, reject) => {
        //  Check if program_to_run exists.
        let fullpath = path.join(project_folder, program_to_run)
        if(!fs.existsSync(fullpath)){
            return reject(`[Error] No pudo crear una tarea. ${fullpath} no existe.`)
        }
        //  cmd.exe /k cd "C:\Code\playground\user_log" & node src\play\testgm.js
        //  Prepare the task action
        if(program_to_run.includes('.js')){
            program_to_run = `node ${program_to_run}`
        }
        let task_action = `"cmd.exe /c cd \\"${project_folder}\\" & ${program_to_run}"`

        if(frequency == 'MONTHLY'){
            days = moment().format('DD')
        }

        let task_cmd_line = `schtasks /Create -tn ${task_name} -sc ${frequency} `
        task_cmd_line += `${!!modifier ? `-mo ${modifier} ` : ''}`
        task_cmd_line += `${!!start_date ? `-sd ${start_date} ` : ''}`
        task_cmd_line += `${!!days ? `-d ${days} ` : ''}`
        task_cmd_line += `${!!username ? `-ru ${username} -rp ${password} ` : ''}`
        task_cmd_line += `-tr ${task_action}`
        cmd.get(
            task_cmd_line,
            function(err, data, stderr){
                if(err){
                    reject(err)
                }
                resolve(data)      
            }
        )
    })
}

const verify_windows_credentials = (username, password) => {
    

    return new Promise((resolve, reject) => {

        let task_name = 'TEST_CREDENTIALS'
        //  cmd.exe /k cd "C:\Code\playground\user_log" & node src\play\testgm.js
        //  Prepare the task action
        let task_action = `notepad.exe`

        let task_cmd_line = `schtasks /Create -tn ${task_name} -sc MONTHLY `
        task_cmd_line += `-ru ${username} -rp ${password} `
        task_cmd_line += `-tr ${task_action}`
        cmd.get(
            task_cmd_line,
            function(err, data, stderr){
                if(err){
                    reject("Credenciales de Windows no inválidas.")
                }

                //  If no error delete the task
                cmd.get(
                    `schtasks /Delete /F -tn ${task_name}`,
                    function(err, data, stderr){
                        resolve(true)      
                    }
                )    
            }
        )
    })
}

const remove_task = (task_name) => {
    
    return new Promise((resolve, reject) => {
        cmd.get(
            `schtasks /Delete /F -tn ${task_name}`,
            function(err, data, stderr){
                resolve(data)      
            }
        )
    })
}

const makeQuestion = (options) => {
    
    const {
        message,
        validation,
        isPassword = false,
        allowNull = false
    } = options;

    let isValueIncorrect = true
    let value
    let validationMessage;

    while (isValueIncorrect) {
        process.stdout.write(`- ${message}`)
        value = readline.question(null, {
            hideEchoBack: isPassword
        })

        let isEmpty = !allowNull && (value.length == 0 || value == '\n')

        if(!!validation){
            try {
                validation(value)
                isInvalid = false
            } catch (error) {
                validationMessage = error
                isInvalid = true
            }
            
        }else{
            isInvalid = false
        }

        if( isEmpty || isInvalid ){

            if(isEmpty){
                console.log('\nError: Debe ingresar algún valor.\n');
            }

            if(isInvalid){
                console.log(`\nError: ${validationMessage}.\n`);
            }

            isValueIncorrect = true
        }else{
            isValueIncorrect = false
        }
    }
    
    return value
}   

const isYes = (answer) => {
    answer = answer.toLowerCase()
    return answer == 's' || answer == 'si'
}

const getProjectFolder = () => {
    
    //  Set the path of the project folder base on whether it is executed with nodejs or as an executable
    let project_folder;
    if(process.pkg){
        //  It is executed with .exe
        project_folder = path.dirname(process.execPath)
        
    }else{
        //  It is executed with nodejs
        project_folder = path.join(__dirname, '..') 
    }

    return project_folder
}

module.exports = {
    replaceAll,
    getDaysToTakeUpTo,
    isWeekEnd,
    parseJsonFile,
    encryptConfigObject,
    decryptConfigObject,
    validateConfigObject,
    createThreeDirectory,
    create_task,
    remove_task,
    makeQuestion,
    isYes,
    isEmail,
    getProjectFolder,
    verify_windows_credentials,
    clearScreen
}