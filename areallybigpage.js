var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')({ path: '/wsareallybigpage'}).listen(server);
var fs = require('fs');

server.listen(3001);

app.use(express.static(__dirname + '/public'));

var jsonfile = require('./areallybigpage.json');
var id = jsonfile['lastid'];
var db = jsonfile['texts'];
var userCount = 0;

for (var textId in db) {
    if (db[textId].text.trim().length == 0  || db[textId].id.indexOf('tempId') > -1) { 
        delete db[textId]; 
    } 
}

function serializeTexts() {
    fs.writeFile('./areallybigpage.json', JSON.stringify({ 'lastid': id, 'texts': db }, null, 2)); 
}

setInterval(serializeTexts, 60 * 1000); // serialize to disk every minute

io.on('connection', function (socket) {
    userCount ++; 
    io.sockets.emit('usercount', userCount);
  
    for (var textId in db) { socket.emit('text', db[textId]); } // when a new user connects, send all past history

    socket.on('temp id', function (data) { 
        socket.emit('new id', { tempId: data.tempId, id: id++ });       // to sender only
    }); 

    socket.on('text', function (data) { 
        if (data.text.length > 0  && data.text.length < 2048 && data.id.indexOf('tempId') == -1) { 
            db[data.id] = data;
            socket.broadcast.emit('text', data); // to all except sender 
        }
        else { 
            delete db[data.id]; 
        }
    });

    socket.on('disconnect', function () { userCount--; socket.broadcast.emit('usercount', userCount); });

});
