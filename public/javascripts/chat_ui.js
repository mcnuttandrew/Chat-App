var socket = io();

function ChatUI($input, $messages){
  this.$input = $input;
  this.$messages = $messages;
  this.chat = new Chat(socket);
}

ChatUI.prototype.getMessage = function(){
  return this.$input.val();
};

ChatUI.prototype.sendMessage = function(message) {
  this.chat.sendMessage(message);
};

ChatUI.prototype.recvMessage = function(message){
  this.$messages.append('<li>' + message + '</li>'); 
};