const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const chalk = require('chalk');

const { generateMessage, generateLocationMessage } = require('./utils/message');
const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(publicPath));

io.on('connection', (socket) => {
    console.log(chalk.blue('New user connected'));

    socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app.'));

    socket.broadcast.emit('newMessage', generateMessage('Admin', 'New user has joined the chat.'));

    socket.on('createMessage', (message, callback) => {
        console.log('New Message:', message);
        io.emit('newMessage', generateMessage(message.from, message.text));
        callback();
    });

    socket.on('createLocationMessage', (coords) => {
        io.emit('newLocationMessage', generateLocationMessage('Admin', coords.latitude, coords.longitude));
    });

    socket.on('disconnect', (socket) => {
        console.log(chalk.red('User has disconnected.'));
    });
});



server.listen(port, () => {
    console.log(chalk.green(`Server is up on port ${port}!`));
});



        //EMIT TO EVERYONE BUT YOURSELF
        // socket.broadcast.emit('newMessage', {
        //     from: message.from,
        //     text: message.text,
        //     createdAt: new Date().getTime()
        // });