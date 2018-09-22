
var {Connection, Request, TYPES} = require('tedious');
const fs = require('fs')
const path = require('path')

class DB {
    constructor(connectionOptions){
        this.connectionOptions = connectionOptions
        this.query_folder = path.join(__dirname, '../queries')
    }

    checkConnection(){
        const connection = new Connection(this.connectionOptions);
        
        return new Promise( (resolve, reject) => {
            connection.on('connect', function(err) {
                if (err) {
                    connection.close()
                    reject(err);
                } else {
                    connection.close()
                    resolve()
                }
            })
        } )
            
    }

    executeQuery(query){

        //  If succeed, returns an object with 2 properties.
        // {
        //     columns: ['Column1_name', 'Column2_name', ....],
        //     rows: [ ['Column1_value', 'Column2_value', ....] , [...] ]
        // }
    
        return new Promise((resolve, reject) => {
            var result = {
                columns: [],
                rows: []   
            };
    
            const connection = new Connection(this.connectionOptions);
    
            connection.on('connect', function(err) {
                if (err) {
                    reject(err);
                } else {
                    let request = new Request(
                        query,
                        function(err, rowCount, rows) {
                            if (err) {
                                reject(err)
                            } else {
                                resolve(result)
                                //console.log(rowCount + ' row(s) returned')
                                connection.close()
                            }
                        }
                    )
    
                    request.on('row', (columns) => {
                        
                        //  Add rows to the result
            
                        let row = columns.map( column => {        
                            return column.value
                        });
    
                        result.rows.push(row)
    
                    });
    
                    request.on('columnMetadata', (columns) => { 
                        //  Add column names to the result
    
                        columns.forEach(column => {
                            result.columns.push(column.colName)
                        })
                        
                    });
            
                    // Execute SQL statement
                    connection.execSql(request);
                }
            })//    End connect
            
        })//    End promise
       
    }

    generateInsertQuery(rows){
        let query = rows.reduce((query, item) => {
            let statement = ` ('${item.username}', '${item.role}', '${item.date}'),`
            return query + statement;
        }, 'insert into User_logs (username, role, date) values')
    
        //  Elimina la ultima coma
        return query.slice(0, -1)
    }
    
    write_user_logs(rows){
        //  Agrega los registros a la tabla de Users_logs.
        //  Se espera un arreglo de objetos del tipo
            // {
            //     username,
            //     role,
            //     date
            // }
    
        let query = this.generateInsertQuery(rows)
    
        let result = this.executeQuery(query)
    
        return result
    
    }
    
    get_users_by_hour(start_date, end_date){
        
        let query = fs.readFileSync(`${this.query_folder}/number_of_users_by_role.sql`).toString();
    
        query = query.replace('@SD', `'${start_date}'`)
        query = query.replace('@ED', `'${end_date}'`)
    
        let result = this.executeQuery(query)
    
        return result
    }
    
    get_users_by_month(start_date, end_date){
        let query = fs.readFileSync(`${this.query_folder}/users_by_month.sql`).toString();
    
        query = query.replace('@SD', `'${start_date}'`)
        query = query.replace('@ED', `'${end_date}'`)
    
        let result = this.executeQuery(query)
    
        return result
    }
    
    get_user_list(start_date, end_date){
        let query = fs.readFileSync(`${this.query_folder}/user_list.sql`).toString();
    
        query = query.replace('@SD', `'${start_date}'`)
        query = query.replace('@ED', `'${end_date}'`)
    
        let result = this.executeQuery(query)
    
        return result
    }
}

module.exports = {
    DB
}