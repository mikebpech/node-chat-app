const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const chalk = require('chalk');

const { generateMessage, generateLocationMessage } = require('./utils/message');
const { isRealString } = require('./utils/validation');
const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(publicPath));

io.on('connection', (socket) => {
    console.log(chalk.blue('New user connected'));

    socket.on('join', (params, callback) => {
        if (!isRealString(params.name) || !isRealString(params.room)) {
            callback('Name and room name are required.');
        };

        socket.join(params.room);
        socket.emit('newMessage', generateMessage('Server', 'Welcome to the chat app.'));
        socket.broadcast.to(params.room).emit('newMessage', generateMessage('Server', `${params.name} has joined the room.`));
    

        callback();
    });

    socket.on('createMessage', (message, callback) => {
        console.log('New Message:', message);
        io.emit('newMessage', generateMessage(message.from, message.text));
        callback();
    });

    socket.on('createLocationMessage', (coords) => {
        io.emit('newLocationMessage', generateLocationMessage('Server', coords.latitude, coords.longitude));
    });

    socket.on('disconnect', (socket) => {
        console.log(chalk.red('User has disconnected.'));
    });
});



server.listen(port, () => {
    console.log(chalk.green(`Server is up on port ${port}!`));
});



//  io.emit -> emits to everyone
//  io.to(room name) -> emits to everyone in that room..
//  socket.broadcast.emit -> emits to everyone but person who sent request
//  socket.broadcast.to(room name) -> emits to everyone but person who sent request IN ROOM
//  socket.emit -> emits to one person