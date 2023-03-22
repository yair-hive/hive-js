const {
    db_post,
    db_get,
    check_parameters,
    get_project_id,
    get_group_id,
} = require('./functions')

const guest_groups = {}

guest_groups['get_all'] = async function(request_body){
    check_parameters(['project_name'], request_body);       
    var project_name = request_body['project_name'];
    var project_id = await get_project_id(project_name); 
    var query_string = `SELECT * FROM guests_groups WHERE project='${project_id}'`;
    var results = await db_get(query_string);
    var new_results = {};
    results.forEach(row =>{
        new_results[row['id']] = row;
    })
    return new_results;
};
guest_groups['delete'] = async function(request_body){
    check_parameters(['group_id', 'project_name'], request_body);
    var group_id = request_body['group_id'];
    var project_id = await get_project_id(request_body['project_name']);
    var query_string = "";
    var und_group_id = await get_group_id(project_id, 'ללא קבוצה');
    query_string += `UPDATE guests SET guest_group = '${und_group_id}' WHERE guest_group = '${group_id}';`; 
    query_string += `DELETE FROM guests_groups WHERE id='${group_id}';`;
    await db_post(query_string);
};
guest_groups['update'] = async function(request_body){
    var filds = {}
    filds['name'] = async function(){
        check_parameters(['group_id', 'name'], request_body);
        var group_id = request_body['group_id'];
        var name = request_body['name'];
        var query_string = `UPDATE guests_groups SET name = '${name}' WHERE id = '${group_id}'`;
        await db_post(query_string);
    };
    filds['color'] = async function(){
        check_parameters(['group_id', 'color'], request_body);
        var group_id = request_body['group_id'];
        var color = request_body['color'];
        var query_string = `UPDATE guests_groups SET color = '${color}' WHERE id = '${group_id}'`;
        await db_post(query_string);
    };
    filds['score'] = async function(){
        check_parameters(['group_id', 'score'], request_body);
        var group_id = request_body['group_id'];
        var score = request_body['score'];
        query_string = `UPDATE guests_groups SET score = '${score}' WHERE id = '${group_id}'`;
        await db_post(query_string);
    };
    check_parameters(['fild'], request_body);
    var fild = request_body['fild'];
    if(!filds[fild]){
        throw new Error('parameter missing: fild');
    }
    await filds[fild]();
};

module.exports = guest_groups