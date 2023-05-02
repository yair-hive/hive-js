const express = require('express')
const map_router = require('./src/routs/map')
const actions_router = require('./src/routs/actions')
const project_router = require('./src/routs/project')
var bodyParser = require('body-parser')
const wss = require('./src/socket')
const api = require('./src/routs/api')
const fs = require('fs')

const app = express()
var file = fs.readFileSync('config.json')
const port = JSON.parse(file.toString()).port

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())

app.use((req, res, next)=>{
    res.set('Access-Control-Allow-Origin', req.get('origin'))
    res.set('Access-Control-Allow-Credentials', 'true')
    next()
})

app.get('/', (req, res)=>{
    res.send('hello world')
})
app.use('/map', map_router)
app.use('/actions', actions_router)
app.use('/project', project_router)
app.use('/api', api)

const server = app.listen(port, function(){
    // console.log(`express start on port ${port}`)
    // process.send(`express start on port ${port}`)
})

server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, socket => {
        wss.emit('connection', socket, request);
    });
})