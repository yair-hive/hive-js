const con = require('../db/mysql/connction')
const express = require('express')
const router = express.Router()

function getAllProjects(){

    var query_string = `SELECT * FROM projects;`

    return new Promise((resolve, reject) => {
        con.query(query_string, (err, result)=>{
            if(err) reject(err)
            else resolve(result)
        })
    })
}

function createProject(name){

    var query_string = `INSERT INTO projects(name) VALUES ('${name}');`

    return new Promise((resolve, reject) => {
        con.query(query_string, (err, result)=>{
            if(err) reject(err)
            else resolve(result)
        })
    })
}

router.get('/', async (req, res)=>{
    res.set('Access-Control-Allow-Origin', req.get('origin'))
    res.set('Access-Control-Allow-Credentials', 'true')
    var projects = await getAllProjects()
    res.json(projects)
})

router.post('/create', async (req, res)=>{

    await createProject(req.body.project_name)

    res.send({msg: req.body})
})

module.exports = router