const express = require('express')
const map_router = require('./src/routs/map')
const actions_router = require('./src/routs/actions')
const ws = require('ws');
const wss = new ws.Server({noServer: true})

wss.on('listening', ()=> console.log('web socket start'))

wss.on('connection', function connection(ws) {
    console.log(`
    connection starts`)
    ws.on('message', function message(data) {
        wss.clients.forEach(function(client) {
            client.send(data.toString());
        });        
    });
});

wss.on('error', (err)=> console.log(err))

const app = express()
const port = 3020

app.use('/map', map_router)
app.use('/actions', actions_router)

const server = app.listen(port, function(){
    console.log("express start")
})

server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, socket => {
        wss.emit('connection', socket, request);
    });
})