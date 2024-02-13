const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Object to store rooms and their participants
const rooms = {};

app.use(express.static(__dirname));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    console.log('a user connected');

    // Handle joining or creating a room
    socket.on('joinOrCreateRoom', (roomCode) => {
        if (!rooms[roomCode]) {
            rooms[roomCode] = [];
            console.log(`Room created: ${roomCode}`);
        }
        socket.join(roomCode);
        rooms[roomCode].push(socket.id);
        console.log(`User joined room: ${roomCode}`);
        // Emit an event to notify client about successful room join
        io.to(socket.id).emit('roomJoined', roomCode);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
        // Find and remove the disconnected user from all rooms
        for (const roomCode in rooms) {
            const index = rooms[roomCode].indexOf(socket.id);
            if (index !== -1) {
                rooms[roomCode].splice(index, 1);
                console.log(`User left room: ${roomCode}`);
                // If no users left in the room, delete the room
                if (rooms[roomCode].length === 0) {
                    delete rooms[roomCode];
                    console.log(`Room deleted: ${roomCode}`);
                }
                break;
            }
        }
    });

    socket.on('chat message', (data) => {
        // Broadcast the message to everyone in the room
        io.sockets.in(data.room).emit('chat message',data);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
