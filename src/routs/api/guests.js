const {
    db_post,
    db_get,
    check_not_exists_f,
    check_parameters,
    get_project_id,
    get_group_id,
} = require('./functions')

const guests = {}

guests['create'] = async function(request_body){
    check_parameters(['guests', 'project_name'], request_body);
    var guests = request_body['guests'];
    var data = JSON.parse(guests);
    var project_name = request_body['project_name'];
    var project_id = await get_project_id(project_name); 
    var query_string = "";
    for(let guest of data){
        var first_name = guest[0];
        var last_name = guest[1];
        var guest_group = guest[2];
        if(!first_name || !last_name || !guest_group) continue;
        var guest_group_id = await get_group_id(project_id, guest_group);
        var s_query_string = `SELECT * FROM guests WHERE first_name='${first_name}' AND last_name='${last_name}' AND guest_group='${guest_group}' AND project='${project_id}'`;
        if(await check_not_exists_f(s_query_string)){
            query_string += `INSERT INTO guests(first_name, last_name, guest_group, project) VALUES('${first_name}', '${last_name}', '${guest_group_id}', '${project_id}');`;
        }
    }
    await db_post(query_string);
};
guests['get_all'] = async function(request_body){
    check_parameters(['project_name'], request_body);
    var project_name = request_body['project_name'];
    var project_id = await get_project_id(project_name);  
    var query_string = `SELECT * FROM guests WHERE project='${project_id}'`;
    return await db_get(query_string);
};
guests['delete'] = async function(request_body){
    check_parameters(['guest_id'], request_body);
    var guest_id = request_body['guest_id']; 
    var query_string = `DELETE FROM guests WHERE id='${guest_id}';`;
    query_string += `DELETE FROM belong WHERE guest='${guest_id}';`;
    await db_post(query_string);
};
guests['update'] = async function(request_body){
    var filds = {}
    filds['first'] = async function(){
        check_parameters(['guest_id', 'first_name'], request_body);
        var guest_id = request_body['guest_id'];
        var first_name = request_body['first_name'];
        var query_string = `UPDATE guests SET first_name = '${first_name}' WHERE id = '${guest_id}'`;
        await db_post(query_string);
    };
    filds['last'] = async function(){
        check_parameters(['guest_id', 'last_name'], request_body);
        var guest_id = request_body['guest_id'];
        var last_name = request_body['last_name'];
        var query_string = `UPDATE guests SET last_name = '${last_name}' WHERE id = '${guest_id}'`;
        await db_post(query_string);
    };
    filds['group'] = async function(){
        check_parameters(['guest_id', 'group_name', 'project_name'], request_body);
        var guest_id = request_body['guest_id'];
        var group_name = request_body['group_name'];
        var project_name = request_body['project_name'];
        var project_id = await get_project_id(project_name);  
        var group_id = await get_group_id(project_id, group_name);
        var query_string = `UPDATE guests SET guest_group = '${group_id}' WHERE id = '${guest_id}'`;
        await db_post(query_string);
    };
    filds['score'] = async function(){
        check_parameters(['guest_id', 'score'], request_body);
        var guest_id = request_body['guest_id'];
        var score = request_body['score'];
        var query_string = `UPDATE guests SET score = '${score}' WHERE id = '${guest_id}'`;
        await db_post(query_string);
    };
    check_parameters(['fild'], request_body);
    var fild = request_body['fild'];
    if(!filds[fild]){
        throw new Error('parameter missing: fild');
    }
    await filds[fild]();
};

module.exports = guests