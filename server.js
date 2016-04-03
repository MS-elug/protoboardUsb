'use strict'

process.on('uncaughtException', (err) => {
    console.log('whoops! there was an error');
});

const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const clc = require('cli-color');
const protoboard = require('./protoboard');

app.use(express.static('public'));

server.listen(3000, function() {
    console.log('Server listening on port 3000');
});


io.on('connection', function(socket) {

    protoboard.on('attach', function(device) {
        socket.emit('protoboard:attach');
    });

    protoboard.on('detach', function(device) {
        socket.emit('protoboard:detach');
    });

    socket.on('ledControl', function(data) { 
        var command = data.enabled ? 'M' : 'A';
        command += data.ledId;
        protoboard.sendData(command);
    });
});