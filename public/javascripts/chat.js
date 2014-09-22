function Chat(socket) {
  this.socket = socket;
}
 
Chat.prototype.sendMessage = function(message){
  socket.emit('message', { message: message });
};