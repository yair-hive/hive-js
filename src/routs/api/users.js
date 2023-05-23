const {
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
} = require('./functions')

const users = {}

users['login'] = async function(request_body, req){
    check_parameters(['user_name', 'password'], request_body);
    var user_name = request_body['user_name']
    var password = request_body['password']
    var query_string = `SELECT * FROM users WHERE user_name = '${user_name}'`
    var user_data = await db_get(query_string)
    if(user_data[0].password == password){
        req.session.user = user_data[0]
    }
    return true
}
users['logout'] = async function(request_body, req){
    req.session.user = undefined
    return true
}
users['create'] = async function(request_body, req){
    check_parameters(['user_name', 'password'], request_body);
    var user_name = request_body['user_name']
    var password = request_body['password']
    var query_string = `INSERT INTO users(user_name, password) VALUES('${user_name}', '${password}')`
    return await db_post(query_string)
}
users['delete'] = async function(request_body, req){
    check_parameters(['user_id'], request_body);
}
users['get_all'] = async function(request_body, req){
    var query_string = `SELECT * FROM users`
    return await db_get(query_string)
}
users['get_active'] = async function(request_body, req){
    return req.session.user?.user_name
}

module.exports = users