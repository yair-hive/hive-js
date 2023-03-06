const con = require('./connction')

function mysqlQuery(query_string){
    return new Promise((resolve, reject) => {
        con.query(query_string, (err, result)=>{
            if(err) reject(err)
            else resolve(result)
        })
    })
}

async function getProjectId(project_name){
    var query_string = `SELECT * FROM projects WHERE name = '${project_name}'`
    var result = await mysqlQuery(query_string)
    return result[0].id
}

async function getMapId(project_name, map_name){
    var project_id = await getProjectId(project_name)
    var query_string = `SELECT * FROM maps WHERE map_name = '${map_name}' AND project = ${project_id}`
    var result = await mysqlQuery(query_string)
    return result[0].id
}

module.exports = {
    mysqlQuery: mysqlQuery,
    getMapId: getMapId,
    getProjectId: getProjectId
}