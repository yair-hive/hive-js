const {
    db_post,
    db_get,
    check_parameters,
} = require('./functions')

const projects = {}

projects['create'] = async function(request_body){
    check_parameters(['name'], request_body);
    var name = request_body['name'];
    var query_string = `INSERT INTO projects (name) VALUES ('${name}')`;
    await db_post(query_string);
};
projects['get'] = async function(request_body){
    var query_string = "SELECT * FROM projects";
    return await db_get(query_string);
};

module.exports = projects