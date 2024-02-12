const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
// const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(__dirname));
app.get('/',(req,res)=> {
    res.sendFile(__dirname + '/index.html')
})
io.on('connection', (socket) => {
    console.log('a user connected');
    

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.on('chat message', (msg) => {
        console.log('message recive : ',msg)
        io.emit('chat message', msg);
    });
});

server.listen(3000, '192.168.1.7', () => {
    console.log('listening on 192.168.1.4:3000');
});
