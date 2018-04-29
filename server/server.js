const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const chalk = require('chalk');

const { generateMessage, generateLocationMessage } = require('./utils/message');
const { isRealString } = require('./utils/validation');
const { Users } = require('./utils/users');
const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
var users = new Users();

app.use(express.static(publicPath));

io.on('connection', (socket) => {
    console.log(chalk.blue('New user connected'));

    socket.on('join', (params, callback) => {
        //Check if name & room are real strings...
        if (!isRealString(params.name) || !isRealString(params.room)) {
            return callback('Name and room name are required.');
        };
        //Check if room name & user name are more than 12 characters.
        if (params.name.length > 12 || params.room.length > 12) {
            return callback('Name & room length must be under 12 characters.');
        }
        //Joins room indicated in params.room
        socket.join(params.room);
        //Calls method removeUser to remove user from list if already exists.
        users.removeUser(socket.id);
        //Adds user into the room to be displayed on the list.
        users.addUser(socket.id, params.name, params.room);

        io.to(params.room).emit('updateUserList', users.getUserList(params.room));
        //Sends to connected user only.
        socket.emit('newMessage', generateMessage('Server', 'Welcome to the chat app.'));
        //Broadcasts that user has joined to others in room.
        socket.broadcast.to(params.room).emit('newMessage', generateMessage('Server', `${params.name} has joined the room.`));
    

        callback();
    });

    socket.on('createMessage', (message, callback) => {
        var user = users.getUser(socket.id);

        if (user && isRealString(message.text)) {
            io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
        } 

        callback();
    });

    socket.on('createLocationMessage', (coords) => {
        var user = users.getUser(socket.id);

        if (user) {
            io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude, coords.longitude));
        }
    });

    socket.on('disconnect', () => {
        var user = users.removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('updateUserList', users.getUserList(user.room));
            io.to(user.room).emit('newMessage', generateMessage('Server', `${user.name} has left the room.`));
        }
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