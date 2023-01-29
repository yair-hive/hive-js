const express = require('express')
const map_router = require('./src/routs/map')
const ws = require('ws');
const socket_server = new ws.Server({noServer: true})

socket_server.on('connection', ()=>{
    console.log('conn')
})

const app = express()
const port = 3020

app.use('/map', map_router)

const server = app.listen(port, function(){
    console.log("express start")
})

server.on('upgrade', (request, socket, head) => {
    socket_server.handleUpgrade(request, socket, head, socket => {
        socket_server.emit('connection', socket, request);
    });
})