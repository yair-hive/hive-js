const ws = require('ws');
const wss = new ws.Server({noServer: true})

wss.on('listening', ()=> console.log('web socket start'))

wss.on('connection', function connection(ws, req) {
    console.log(`
    connection starts`)
    ws.on('message', function message(data) {
        wss.clients.forEach(function(client) {
            client.send(data.toString());
        });        
    });
});

wss.on('error', (err)=> console.log(err))

module.exports = wss