const {
    db_post,
    db_get,
    check_exists,
    check_parameters,
    get_project_id,
} = require('./functions')

const requests_belongs = {}

requests_belongs['create'] = async function(request_body){
    check_parameters(['guest_id', 'tag_id', 'project_name'], request_body);
    var guest_id = request_body['guest_id'];
    var request_id = request_body['tag_id'];
    var project_name = request_body['project_name'];
    var project_id = await get_project_id(project_name); 
    var query_string = `SELECT * FROM guests_requests WHERE guest = '${guest_id}' AND request = '${request_id}'`;
    await check_exists(query_string);
    var query_string = `INSERT INTO guests_requests(guest, request, project) VALUES('${guest_id}', '${request_id}', '${project_id}')`;
    await db_post(query_string);
};
requests_belongs['delete'] = async function(request_body){
    check_parameters(['request_id'], request_body);
    var request_id = request_body['request_id'];
    var query_string = `DELETE FROM guests_requests WHERE id = '${request_id}'`;
    await db_post(query_string);
};
requests_belongs['get_all'] = async function(request_body){
    check_parameters(['project_name'], request_body); 
    var project_name = request_body['project_name'];   
    var project_id = await get_project_id(project_name);
    var query_string = `SELECT * FROM guests_requests WHERE project = '${project_id}'`;
    return await db_get(query_string);
};

module.exports = requests_belongs