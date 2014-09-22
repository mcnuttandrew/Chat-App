function createChat(server) {  
  var io = require('socket.io')(server);
  var guestNumber = 1;
  var nicknames = {};

  io.on('connection', function (socket) {
    _setNickname(_generateNickname());
    
    socket.emit('listUsers', {users: _getUsers()});
    io.emit('userConnect', { nickname: _nickname() });
    
    socket.on('message', function (data) {
      io.emit('message', { text: data.message });
    });
    
    socket.on('nicknameChangeRequest', function (data) {
      var nickname = data.nickname;
      
      if (_nicknameTaken(nickname)) {
        socket.emit('nicknameChangeResult', {
          success: false,
          message: 'That nickname is already taken.'
        });
      } else if (_isInvalidFormat(nickname)) {
        socket.emit('nicknameChangeResult', {
          success: false,
          message: 'Nicknames cannot begin with "guest" and end with a number.'
        });
      } else {
        _setNickname(nickname);
      }
    });

    socket.on('disconnect', function () {
      io.emit('userDisconnect', {
        nickname: nicknames[socket.id]
      });
      delete nicknames[socket.id];
    });
    
    function _nickname () {
      return nicknames[socket.id];
    }
    
    function _setNickname (nickname) {
      var oldNickname = _nickname();
      nicknames[socket.id] = nickname;

      socket.emit('nicknameChangeResult', {
        success: true,
        message: nickname
      });
      
      if (oldNickname) {
        io.emit('userChangeName', {
          oldNickname: oldNickname,
          newNickname: nickname
        });
      }
    }

    function _generateNickname () {
      return 'guest' + guestNumber++;
    }
  
    function _nicknameTaken (nickname) {
      for (var key in nicknames) {
        if (nicknames[key] === nickname) {
          return true;
        }
      }
      return false;
    }

    function _isInvalidFormat (nickname) {
      return nickname.match(/guest\d{0,}/);
    }
    
    function _getUsers (){
      var userNames = [];
      for(var key in nicknames){ 
        userNames.push(nicknames[key]);
      }
      return userNames;
    }
  });
}

module.exports = createChat;