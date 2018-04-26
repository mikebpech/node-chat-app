const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const chalk = require('chalk');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);
var io = socketIO(server);

app.use(express.static(publicPath));

io.on('connection', (socket) => {
    console.log(chalk.blue('New user connected'));

    socket.on('disconnect', (socket) => {
        console.log(chalk.red('User has disconnected.'));
    });
});



server.listen(port, () => {
    console.log(chalk.green(`Server is up on port ${port}!`));
});