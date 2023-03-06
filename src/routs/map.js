const con = require('../db/mysql/connction')
const express = require('express')
const router = express.Router()
const {getProjectId, mysqlQuery} = require('../db/mysql/functions')

async function getAllMaps(project_name){
    var project_id = await getProjectId(project_name)
    var query_string = `SELECT * FROM maps WHERE project = ${project_id}`
    return await mysqlQuery(query_string)

}

async function createMap(project_name, map_name, rows, cols){
    var project_id = await getProjectId(project_name)
    var query_string = `INSERT INTO maps(map_name, rows_number, columns_number, project) VALUES('${map_name}', '${rows}', '${cols}', '${project_id}')`;
    return await mysqlQuery(query_string)
}

router.get('/:project_name', async (req, res)=>{
    var maps = await getAllMaps(req.params.project_name)
    res.json(maps)
})

router.post('/:project_name/create', async (req, res)=>{
    var {project_name} = req.params
    var {map_name, rows, cols} = req.body
    var result = await createMap(project_name, map_name, rows, cols)
    res.json(result)
})

router.get('/', (req, res)=>{
    res.send('FSF')
})

module.exports = router