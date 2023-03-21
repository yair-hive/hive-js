const {
    db_post,
    db_get,
    check_parameters,
    get_map_id,
} = require('./functions')

const seats_groups = {}

seats_groups['create'] = async function(request_body){
    check_parameters(['group_name', 'from_row', 'from_col', 'to_row', 'to_col', 'map_name', 'project_name'], request_body);
    var group_name = request_body['group_name'];
    var from_row = request_body['from_row'];
    var from_col = request_body['from_col'];
    var to_row = request_body['to_row'];
    var to_col = request_body['to_col'];
    var map_name = request_body['map_name'];
    var project_name = request_body['project_name'];
    var map_id = await get_map_id(map_name, project_name);
    var query_string = `INSERT INTO seats_groups(name, from_row, from_col, to_row, to_col, map) VALUES('${group_name}', '${from_row}', '${from_col}', '${to_row}', '${to_col}', '${map_id}')`;
    return await db_post(query_string);
};
seats_groups['get_all'] = async function(request_body){
    check_parameters(['map_name', 'project_name'], request_body);
    var map_name = request_body['map_name'];
    var project_name = request_body['project_name'];
    var map_id = await get_map_id(map_name, project_name);
    var query_string = `SELECT * FROM seats_groups WHERE map = '${map_id}'`;
    return await db_get(query_string);
};
seats_groups['delete'] = function(request_body){};
seats_groups['update'] = function(request_body){}; 

module.exports = seats_groups