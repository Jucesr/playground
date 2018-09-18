const cmd = require('node-cmd');
const fs = require('fs');
const moment = require('moment');

const user_role = require('../../config/user_role.json');
const {write_user_logs} = require('../utils/db')

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

// cmd.get(
//     'quser',
//     function(err, data, stderr){
        
//     }
// );

const format_user_log_data = input_data => {
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
            idle_time: user_log_array[QUSER_COLUMS.IDLE_TIME] == '.' ? 0 :parseInt(user_log_array[QUSER_COLUMS.IDLE_TIME])
            // date: user_log_array[QUSER_COLUMS.LOGON_TIME_DATE],
            // hour: user_log_array[QUSER_COLUMS.LOGON_TIME_HOUR],
            // ampm: user_log_array[QUSER_COLUMS.LOGON_TIME_AMPM]
        }

        return user_log

    })
    return user_logs
}

const prepare_user_logs = (data, rows, ran) => {
    //  Prepara los registros de acuerdo a la tabla en la base de datos.
    rows.map(row => data.push({
        username: row.username,
        role: user_role[row.username],
        date: moment(ran).format('YYYY-MM-DD HH:mm')
    }))

    return data;
}

const file = fs.readFileSync(`../input_files/users_input.txt`, 'utf8');
let user_logs = format_user_log_data(file)

//  Elimina usarios inactivos
user_logs = user_logs.filter(user => user.state == 'Active' && user.idle_time < 60)




let max = Date.parse("January 2017");
let min = Date.parse("July 2018");

let data = []

for (let index = 0; index < 999; index++) {
    
    let ran = getRandomInteger(min, max)
    let username = user_logs[getRandomInteger(0, 12)].username
    data.push({
        username: username,
        role: user_role[username],
        date: moment(ran).format('YYYY-MM-DD HH:mm')
    })

    //  Prepara registros para insertar a base de datos
    //data = prepare_user_logs(data, user_logs, ran)
}

write_user_logs(data)


    // setInterval(() => {
    //     let ran = getRandomInteger(min, max)

    //     //  Prepara registros para insertar a base de datos
    //     user_logs = prepare_user_logs(user_logs, ran)

    //     //  Escribe los registros en la base de datos
    //     console.log( moment(ran).format('YYYY-MM-DD HH:mm'));
    //     write(user_logs)
    // }, 5000)


function getRandomInteger(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}
