const ws = require('ws');
const { v4: uuidv4 } = require('uuid');
const wss = new ws.Server({noServer: true})

wss.connections = {}

wss.on('listening', ()=> console.log('web socket start'))

wss.on('connection', function connection(ws, req) {
    var id = uuidv4()
    ws.id = id
    wss.connections[id] = ws
    console.log(`connection starts`)
    ws.send(JSON.stringify({action: 'connection_id', id: id}))
    ws.on('message', function message(data) {
        wss.clients.forEach(function(client) {
            if(client.readyState === ws.OPEN) client.send(data.toString());
        });        
    });
});

wss.on('error', (err)=> console.log(err))

wss.sendTo = function(id, data){
    wss.connections[id].send(JSON.stringify(data))
}

module.exports = wss