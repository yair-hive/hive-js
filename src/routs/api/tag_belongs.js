const {
    db_post,
    db_get,
    check_parameters,
    get_map_id,
    get_tag_id,
} = require('./functions')

const tag_belongs = {}

tag_belongs['create'] = async function(request_body){
    check_parameters(['seats', 'tag_name', 'map_name', 'project_name'], request_body);
    var seats = JSON.parse(request_body['seats']);
    var tag_name = request_body['tag_name'];
    var map_name = request_body['map_name'];
    var project_name = request_body['project_name'];
    var map_id = await get_map_id(map_name, project_name);   
    var tag_id = await get_tag_id(tag_name, project_name);
    var query_string = "";
    seats.forEach(seat => {
        query_string += `INSERT INTO tag_belongs(seat, tag, map) VALUES('${seat}', '${tag_id}', '${map_id}');`;
    } )     
    return await db_post(query_string);
};
tag_belongs['get_all'] = async function(request_body){
    check_parameters(['map_name', 'project_name'], request_body);
    var map_name = request_body['map_name'];
    var project_name = request_body['project_name'];
    var map_id = await get_map_id(map_name, project_name);  
    var query_string = `SELECT * FROM tag_belongs WHERE map = '${map_id}'`;
    var results = await db_get(query_string);
    var new_results = {};
    results.forEach(row =>{
        new_results[row['seat']] = [];
    })
    results.forEach(row =>{
        new_results[row['seat']].push(row);
    })
    return new_results;
};

module.exports = tag_belongs