const {
    db_post,
    db_get,
    check_parameters,
    get_map_id,
} = require('./functions')

const map_elements = {}

map_elements['create'] = async function(request_body){
    check_parameters(['map_name', 'project_name', 'element_name', 'from_row', 'from_col', 'to_row', 'to_col'], request_body);
    var map_name = request_body['map_name'];
    var project_name = request_body['project_name'];
    var map_id = await get_map_id(map_name, project_name); 
    var element_name = request_body["element_name"];
    var from_row = request_body["from_row"];
    var from_col = request_body["from_col"];
    var to_row = request_body["to_row"];
    var to_col = request_body["to_col"];
    var query_string = `INSERT INTO map_elements(name, from_row, from_col, to_row, to_col, map) VALUES('${element_name}', '${from_row}', '${from_col}', '${to_row}', '${to_col}', '${map_id}')`;
    await db_post(query_string);
};
map_elements['get_all'] = async function(request_body){
    check_parameters(['map_name', 'project_name'], request_body);
    var map_name = request_body['map_name'];
    var project_name = request_body['project_name'];
    var map_id = await get_map_id(map_name, project_name);  
    var query_string =` SELECT * FROM map_elements WHERE map = '${map_id}'`;
    return await db_get(query_string);
};
map_elements['delete'] = async function(request_body){
    check_parameters(['elements_ids'], request_body);
    var elemens_ids = JSON.parse(request_body['elements_ids']);
    var query_string = "";
    elemens_ids.forEach(id =>  {
        query_string += `DELETE FROM map_elements WHERE id = '${id}'`;
    })
    await db_post(query_string);
};

module.exports = map_elements