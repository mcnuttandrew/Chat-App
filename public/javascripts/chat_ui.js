var socket = io();

function ChatUI($form, $input, $messages) {
  this.running = false;
  this.$form = $form;
  this.$input = $input;
  this.$messages = $messages;
  this.chat = new Chat(socket);
}

ChatUI.prototype.run = function () {
  if (this.running) {
    console.log('ChatUI is already running!');
  } else {
    this.bindEvents();
    this.$input.focus();
  }
};

ChatUI.prototype.bindEvents = function () {
  this.$form.on('submit', function (event) {
    event.preventDefault();
    
    var message = this.getMessage();
    this.sendMessage(message);
  }.bind(this));
  
  socket.on('message', function (data) {
    this.recvMessage(data.text);
  }.bind(this));
};

ChatUI.prototype.getMessage = function () {
  return this.$input.val();
};

ChatUI.prototype.sendMessage = function (message) {
  this.chat.sendMessage(message);
  this.resetForm();
};

ChatUI.prototype.recvMessage = function (message) {
  this.$messages.append('<li>' + message + '</li>'); 
};

ChatUI.prototype.resetForm = function () {
  this.$input.val('');
  this.$input.focus();
};