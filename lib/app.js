var http = require('http');
var static = require('node-static');
var socketio = require('socket.io');
var createChat = require('./chat_server.js');

var file = new static.Server("./public");

var server = http.createServer(function(req, res){
  req.addListener('end', function(){
    file.serve(req, res);
  }).resume();
});

createChat(server);

server.listen(8000);


