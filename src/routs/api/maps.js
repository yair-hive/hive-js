const {
    db_post,
    db_get,
    db_get_one,
    check_exists,
    check_parameters,
    get_project_id,
    get_map_id,
} = require('./functions')

const maps = {}

maps['create'] = async function(request_body){
    check_parameters(['map_name', 'rows', 'cols', 'project_name'], request_body);
    var map_name = request_body['map_name'];
    var rows_number = request_body['rows'];
    var columns_number = request_body['cols']; 
    var project_id = await get_project_id(request_body['project_name']);
    var query_string = `SELECT * FROM maps WHERE map_name = '${map_name}' AND project = '${project_id}'`;
    await check_exists(query_string);             
    var query_string = `INSERT INTO maps(map_name, rows_number, columns_number, project) VALUES('${map_name}', '${rows_number}', '${columns_number}', '${project_id}')`;
    await db_post(query_string);
};
maps['get_all'] = async function(request_body){
    check_parameters(['project_name'], request_body);
    var project_name = request_body['project_name']; 
    var project_id = await get_project_id(project_name);   
    var query_string = `SELECT * FROM maps WHERE project='${project_id}'`;
    return await db_get(query_string);
};
maps['get'] = async function(request_body){
    check_parameters(['map_name', 'project_name'], request_body);
    var map_name = request_body['map_name'];
    var project_name = request_body['project_name'];
    var map_id = await get_map_id(map_name, project_name); 
    var query_string = `SELECT * FROM maps WHERE id='${map_id}'`;
    return await db_get_one(query_string);
};
maps['update'] = async function(request_body){
    var filds = {}
    filds['map_name'] = async function(){
        check_parameters(['map_name', 'project_name', 'new_name'], request_body)
        var map_name = request_body['map_name']
        var project_name = request_body['project_name']
        var new_name = request_body['new_name']
        var map_id = await get_map_id(map_name, project_name); 
        var query_string = `UPDATE maps SET map_name = '${new_name}' WHERE id = '${map_id}'`;
        return await db_post(query_string);
    }

    filds['cols_to'] = async function(){
        check_parameters(['map_name', 'project_name', 'to'], request_body);
        var map_name = request_body['map_name'];
        var project_name = request_body['project_name'];
        var to = request_body['to']; 
        var map_id = await get_map_id(map_name, project_name);    
        var query_string = `UPDATE maps SET cols_to = '${to}' WHERE id = '${map_id}'`;
        return await db_post(query_string);
    };
    filds['add_row'] = async function(){
        check_parameters(['map_name', 'project_name', 'row'], request_body);
        var project_name = request_body['project_name'];
        var map_name = request_body['map_name'];
        var map_id = await get_map_id(map_name, project_name);     
        var row = request_body['row'];
        var query_string = "";
        query_string += `UPDATE maps SET rows_number = rows_number + 1 WHERE id = '${map_id}';`;
        query_string += `UPDATE SEATS SET row_num = row_num + 1 WHERE row_num > '${row}' AND map='${map_id}';`;
        return await db_post(query_string);
    };
    filds['add_col'] = async function(){
        check_parameters(['map_name', 'project_name', 'col'], request_body);
        var project_name = request_body['project_name'];
        var map_name = request_body['map_name'];
        var map_id = await get_map_id(map_name, project_name);     
        var col = request_body['col'];
        var query_string = "";
        query_string += `UPDATE maps SET columns_number = columns_number + 1 WHERE id = '${map_id}';`;
        query_string += `UPDATE SEATS SET col_num = col_num + 1 WHERE col_num > '${col}' AND map='${map_id}';`;
        return await db_post(query_string);
    };
    filds['delete_row'] = async function(){
        check_parameters(['map_name', 'project_name', 'row'], request_body);
        var project_name = request_body['project_name'];
        var map_name = request_body['map_name'];
        var map_id = await get_map_id(map_name, project_name);     
        var row = request_body['row'];
        var query_string = "";
        query_string += `UPDATE maps SET rows_number = rows_number - 1 WHERE id = '${map_id}';`;
        query_string += `DELETE FROM seats WHERE row_num = '${row}' AND map='${map_id}';`;
        query_string += `UPDATE SEATS SET row_num = row_num - 1 WHERE row_num > '${row}' AND map='${map_id}';`;
        return await db_post(query_string);
    };
    filds['delete_col'] = async function(){
        check_parameters(['map_name', 'project_name', 'col'], request_body);
        var project_name = request_body['project_name'];
        var map_name = request_body['map_name'];
        var map_id = await get_map_id(map_name, project_name);     
        var col = request_body['col'];
        var query_string = "";
        query_string += `UPDATE maps SET columns_number = columns_number - 1 WHERE id = '${map_id}';`;
        query_string += `DELETE FROM seats WHERE col_num = '${col}' AND map='${map_id}';`;
        query_string += `UPDATE SEATS SET col_num = col_num - 1 WHERE col_num > '${col}' AND map='${map_id}';`;
        return await db_post(query_string);
    };
    check_parameters(['fild'], request_body);
    var fild = request_body['fild'];
    if(!filds[fild]){
        throw new Error('parameter missing: fild');
    }
    await filds[fild]();
};

module.exports = maps