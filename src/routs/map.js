const express = require('express')
const mysql = require('mysql')
const router = express.Router()

const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "hive"
})

router.get('/:map_name', (req, res)=>{
    con.connect((err)=>{
        if(err){
            console.log(err)
            res.send(err)
        }
        var query_string = `SELECT * FROM maps WHERE map_name='${req.params.map_name}'`
        con.query(query_string, (err, result)=>{
            if(err){
                console.log(err)
                res.send(err)
            }
            res.json(result)
        })
    })
})

module.exports = router