const cmd = require('node-cmd');
const fs = require('fs');
const moment = require('moment');
const path = require('path')
const {parseJsonFile, validateConfigObject, getProjectFolder, decryptConfigObject} = require('./utils/helpers')
const {updateConfigsFromGoogleSheet} = require('./utils/google')
const Cryptr = require('cryptr')

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

const {DATABASE_OPTIONS, GOOGLE_OPTIONS} = config;

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
        role: !!roles[row.username] ? roles[row.username] : 'Indefinido',
        date: moment().format('YYYY-MM-DD HH:mm')
    }))
}

//  ------------------------------------------------------------------------------------------------------
//  Updates user roles and color for charts from google sheet
//  ------------------------------------------------------------------------------------------------------

updateConfigsFromGoogleSheet(project_folder, GOOGLE_OPTIONS).then(user_role => {
    //  ------------------------------------------------------------------------------------------------------
    //  Get users that are connected with QUSER
    //  ------------------------------------------------------------------------------------------------------
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





