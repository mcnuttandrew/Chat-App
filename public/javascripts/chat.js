function Chat(socket) {
  this.socket = socket;
  this.room = 'lobby';
}

Chat.prototype.processCommand = function (command) {
  var split = command.split(' ');
  var cmd = split[0].substr(1);
  var args = split.slice(1);

  switch (cmd) {
    case 'nick':
      var nickname = args[0];
      this.socket.emit('nicknameChangeRequest', { 
        nickname: nickname 
      });
      break;
      
    case 'join':
      var room = args[0];
      this.socket.emit('changeRoomRequest', {
        room: room
      });
      break;
    
    default:
      console.log('Command:', cmd, 'Arguments:', args);
      break;
  }
};
 
Chat.prototype.sendMessage = function (message) {
  this.socket.emit('message', { message: message });
};