const {
    db_post,
    db_get,
    check_not_exists_f,
    check_parameters,
    get_project_id,
} = require('./functions')

const seat_belongs = {}

seat_belongs['create'] = async function(request_body){
    check_parameters(['project_name', 'seat_id', 'guest_id'], request_body);
    var project_name = request_body['project_name'];
    var project_id = await get_project_id(project_name);   
    var seat_id = request_body['seat_id'];
    var guest_id = request_body['guest_id'];
    var query_string = "";
    query_string += `DELETE FROM belong WHERE guest='${guest_id}';`;
    query_string += `DELETE FROM belong WHERE seat='${seat_id}';`;
    query_string += `INSERT INTO belong(guest, seat, project) VALUES('${guest_id }', '${seat_id}', '${project_id}');`;
    await db_post(query_string);
};
seat_belongs['get_all'] = async function(request_body){
    check_parameters(['project_name'], request_body);
    var project_name = request_body['project_name'];
    var project_id = await get_project_id(project_name);  
    var query_string = `SELECT * FROM belong WHERE project='${project_id}'`;
    return await db_get(query_string);
};
seat_belongs['check'] = async function(request_body){
    check_parameters(['guest_id'], request_body);  
    var guest_id = request_body['guest_id'];
    var query_string = `SELECT * FROM belong WHERE guest='${guest_id}'`;
    if(await check_not_exists_f(query_string)){
        return {exist: false};
    }else{
        return {exist: true};
    }

};
seat_belongs['delete_all'] = async function(request_body){
    check_parameters(['project_name'], request_body);
    var project_name = request_body['projct_name'];
    var project_id = await get_project_id(project_name);  
    var query_string = `DELETE FROM belong WHERE project='${project_id}'`;
    return await db_get(query_string);
};

module.exports = seat_belongs