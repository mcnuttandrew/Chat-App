var socket = io();

function ChatUI($form, $input, $messages, $users) {
  this.running = false;
  this.$form = $form;
  this.$input = $input;
  this.$messages = $messages;
  this.$users = $users;
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
    
    var input = this.getInputValue();
    
    if (input[0] === '/') {
      this.chat.processCommand(input);
    } else {
      this.chat.sendMessage(input); 
    }
    
    this.resetForm();
  }.bind(this));
  
  socket.on('listUsers', function(data){
    data.users.forEach( this.addUser.bind(this));
  }.bind(this));
  
  socket.on('userConnect', function (data) {
    this.recvMessage(data.nickname + " has connected.");
    this.addUser(data.nickname);
  }.bind(this));
  
  socket.on('userDisconnect', function (data) {
    this.recvMessage(data.nickname + " has disconnected.");
    this.removeUser(data.nickname);
  }.bind(this));
  
  socket.on('userChangeName', function (data) {
    this.recvMessage(data.oldNickname + " is now " + data.newNickname + ".");
    this.updateUser(data.oldNickname, data.newNickname);
  }.bind(this));

  socket.on('message', function (data) {
    this.recvMessage(data.text);
  }.bind(this));
  
  socket.on('nicknameChangeResult', function (data) {
    console.log(data);
  }.bind(this));
};

ChatUI.prototype.getInputValue = function () {
  return this.$input.val();
};

ChatUI.prototype.recvMessage = function (message) {
  this.$messages.prepend('<li>' + message + '</li>'); 
};

ChatUI.prototype.addUser = function (user) {
  var $user = this.findUser(user);
  
  if (!$user) {
    this.$users.append('<li>' + user + '</li>'); 
  }
};

ChatUI.prototype.removeUser = function (user) {
  var $user = this.findUser(user);
  
  if ($user) {
    $user.remove();
  }
};

ChatUI.prototype.updateUser = function (oldNickname, newNickname) {
  var $user = this.findUser(oldNickname);
  
  if ($user) {
    $user.text(newNickname);
  }
};

ChatUI.prototype.findUser = function (user) {
  var $user = null;
  
  this.$users.children("li").each(function () {    
    var $el = $(this);
    
    if ($el.text() === user) {
      $user = $el;
      return;
    }
  });
  
  return $user
}

ChatUI.prototype.resetForm = function () {
  this.$input.val('');
  this.$input.focus();
};