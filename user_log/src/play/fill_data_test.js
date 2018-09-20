const cmd = require('node-cmd');
const fs = require('fs');
const moment = require('moment');


const {DB} = require('../utils/db')
const database = new DB({
    userName: "sa",
    password: "1234",
    server: "localhost",
    options: {
      database: "HERMOSILLO_USER_LOG",
      encrypt: false,
      connectionTimeout: 60000,
      requestTimeout: 60000
    }
  })

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

function getRandomInteger(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
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
const user_role = require('../config/user_role.json')
const users = Object.keys(user_role)

let max = Date.parse("September 2018");
let min = Date.parse("October 2018");

let data = []

for (let index = 0; index < 999; index++) {
    
    let ran = getRandomInteger(min, max)
    let username = users[getRandomInteger(0, users.length - 1)]
    data.push({
        username: username,
        role: user_role[username],
        date: moment(ran).format('YYYY-MM-DD HH:mm')
    })

    //  Prepara registros para insertar a base de datos
    //data = prepare_user_logs(data, user_logs, ran)
}

database.write_user_logs(data).then(r => {
    console.log(r);
    
})



