const {
    db_post,
    db_get,
    check_parameters,
    get_project_id,
} = require('./functions')

const tags = {}

tags['get_all'] = async function(request_body){
    check_parameters(['project_name'], request_body);
    var project_name = request_body['project_name'];
    var project_id = await get_project_id(project_name); 
    var query_string = `SELECT * FROM tags WHERE project = '${project_id}'`;
    var results = await db_get(query_string);
    var new_results = {};
    results.forEach(row =>{
        new_results[row['id']] = row;
    })
    return new_results;
};
tags['delete'] = async function(request_body){
    check_parameters(['tag_id'], request_body);
    var tag_id = request_body['tag_id'];
    var query_string = `DELETE FROM tags WHERE id = '${tag_id}';`;
    query_string += `DELETE FROM guests_requests WHERE request = '${tag_id}';`;
    query_string += `DELETE FROM tag_belongs WHERE tag = '${tag_id}';`;
    await db_post(query_string);
};
tags['update'] = async function(request_body){
    var filds = {}
    filds['name'] = async function(){
        check_parameters(['name', 'tag_id'], request_body);
        var name = request_body['name'];
        var tag_id = request_body['tag_id'];
        var query_string = `UPDATE tags SET name = '${name}' WHERE  id = '${tag_id}'`;
        await db_post(query_string);
    };
    filds['color'] = async function(){
        check_parameters(['color', 'tag_id'], request_body);
        var color = request_body['color'];
        var tag_id = request_body['tag_id'];
        var query_string = `UPDATE tags SET color = '${color}' WHERE  id = '${tag_id}'`;
        await db_post(query_string);
    };
    filds['score'] = async function(){
        check_parameters(['score', 'tag_id'], request_body);
        var score = request_body['sscore'];
        var tag_id = request_body['tag_id'];
        var query_string = `UPDATE tags SET score = '${score}' WHERE  id = '${tag_id}'`;
        await db_post(query_string);
    };
    check_parameters(['fild'], request_body);
    var fild = request_body['fild'];
    if(!filds[fild]){
        throw new Error('parameter missing: fild');
    }
    await filds[fild]();
};

module.exports = tags