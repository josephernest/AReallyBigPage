var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

server.listen(3001);

app.use(express.static(__dirname + '/public'));

var id = 1;

io.on('connection', function (socket) {
  socket.on('temp id', function (data) { socket.emit('new id', {tempId: data.tempId, id: id++}); }); // to sender only
  socket.on('text', function (data) { socket.broadcast.emit('text', data);  }); // to all except sender 
});