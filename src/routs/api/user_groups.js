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

const user_groups = {}

user_groups['get_all'] = async function(request_body){
    var query_string = `SELECT * FROM users_groups`
    var groups = await db_get(query_string)
    var new_groups = []
    for(let group of groups){
        var group_id = group.id
        var query_string = `SELECT * FROM users_groups_actions WHERE belong = ${group_id}`
        group.actions = await db_get(query_string)
        new_groups.push(group)
    }
    return new_groups
}
user_groups['get_group_actions'] = async function(request_body){
    check_parameters(['group_id'], request_body)
    var group_id = request_body['group_id']
    var query_string = `SELECT * FROM users_groups_actions WHERE belong = ${group_id}`
    return await db_get(query_string)
}
user_groups['create'] = async function(request_body){
    check_parameters(['name'], request_body)
    var name = request_body['name']
    var query_string = `INSERT INTO users_groups(name) VALUES('${name}')`
    return await db_post(query_string)
}
user_groups['add_action'] = async function(request_body){
    check_parameters(['group_id', 'action_name'], request_body)
    var belong = request_body['group_id']
    var action = request_body['action_name']
    var query_string = `INSERT INTO users_groups_actions(belong, action) VALUES('${belong}', '${action}')`
    return await db_post(query_string)
}


module.exports = user_groups