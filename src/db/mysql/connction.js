const mysql = require('mysql')

const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "hive",
    multipleStatements: true
})

con.connect()

module.exports = con