const con = require('../../db/mysql/connction')

function db_post(query_string){
    return new Promise((resolve, reject) => {
        con.query(query_string, (err, result)=>{
            if(err) reject(err)
            else resolve(result)
        })
    })
}
function db_get(query_string){
    return new Promise((resolve, reject) => {
        con.query(query_string, (err, result)=>{
            if(err) reject(err)
            else resolve(result)
        })
    })
}
function db_get_one(query_string){
    return new Promise((resolve, reject) => {
        con.query(query_string, (err, result)=>{
            if(err) reject(err)
            else resolve(result[0])
        })
    })
}

function check_exists(query_string){
    return new Promise((resolve, reject) => {
        con.query(query_string, (err, result)=>{
            if(err) reject(err)
            else if(result.length != 0){
                throw new Error('exists')
            }
            else resolve(result)
        })
    })   
}
function check_not_exists_f(query_string){
    return new Promise((resolve, reject) => {
        con.query(query_string, (err, result)=>{
            if(err) reject(err)
            else resolve(result.length == 0)
        })
    }) 
}
function check_parameters(parameters, request_body){
    parameters.forEach(param => {
        if(!request_body[param] || request_body[param].length == 0){
            throw new Error('חסר פרמטר '+param);
        }
    })

}

async function get_project_id(project_name){
    var query_string = `SELECT id FROM projects WHERE name = '${project_name}'`;
    var result = await db_get(query_string)
    return await result[0]['id'];
}
async function get_map_id(map_name, project_name){
    var project_id = await get_project_id(project_name);
    var query_string = `SELECT id FROM maps WHERE map_name = '${map_name}' AND project = '${project_id}'`;
    var result = await db_get(query_string)
    return result[0]['id'];
}

async function create_default_group(project_id, group_name){
    var color = '#2b4e81';
    var score = 0;
    var query_string = `INSERT INTO guests_groups(name, color, score, project) VALUES('${group_name}', '${color}', '${score}', '${project_id}')`;
    await db_post(query_string);
}
async function get_group_id(project_id, group_name){
    if(group_name.length == 0){
        group_name = 'ללא קבוצה';
    }
    var query_string = `SELECT * FROM guests_groups WHERE name = '${group_name}' AND project = '${project_id}'`;
    var result = await db_get_one(query_string);
    if(result){
        return result['id'];
    }else{
        await create_default_group(project_id, group_name);
        query_string = `SELECT * FROM guests_groups WHERE name = '${group_name}' AND project = '${project_id}'`;
        result = await db_get_one(query_string);
        return result['id'];
    }
}
async function get_tag_id(tag_name, project_name){
    var project_id = await get_project_id(project_name);
    var query_string = `SELECT id FROM tags WHERE name = '${tag_name}' AND project = '${project_id}'`;
    var result = await db_get_one(query_string);
    if(!result){
        await create_default_tag(tag_name, project_name);
        result = await db_get_one(query_string);
    }
    return result['id'];
};
async function create_default_tag(tag_name, project_name){
    var project_id = await get_project_id(project_name);
    var query_string = `INSERT INTO tags(name, color, score, project) VALUES('${tag_name}', '#2b4e81', '0', '${project_id}')`;
    await db_post(query_string);
}

module.exports = {
    db_post,
    db_get,
    db_get_one,
    check_exists,
    check_not_exists_f,
    check_parameters,
    get_project_id,
    get_map_id,
    get_group_id,
    get_tag_id,
}