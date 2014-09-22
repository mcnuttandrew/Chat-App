function createChat(server) {  
  var io = require('socket.io')(server);
  var guestNumber = 1;
  var nicknames = {};
  var currentRooms = {};

  io.on('connection', function (socket) {
    _setNickname(_generateNickname());
    joinRoom('lobby');
  
    io.to(currentRooms[socket.id]).emit('userConnect', { nickname: _nickname() });
    
    socket.on('message', function (data) {
      io.to(currentRooms[socket.id]).emit('message', { 
        user: _nickname(),
        text: data.message
      });
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
    
    socket.on('changeRoomRequest', function (data) {
      io.to(currentRooms[socket.id]).emit('userExit', {nickname: _nickname()})
      _handleChangeRoomRequest(data.room);
      io.to(currentRooms[socket.id]).emit('userEnter', {nickname: _nickname()})
    })

    socket.on('disconnect', function () {
      io.to(currentRooms[socket.id]).emit('userDisconnect', {
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
        io.to(currentRooms[socket.id]).emit('userChangeName', {
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

      for (var key in nicknames) {
        if (currentRooms[key] === currentRooms[socket.id]) {
          userNames.push(nicknames[key]);
        }
      }

      return userNames;
    }
    
    function joinRoom (room) {
      socket.join(room);
      currentRooms[socket.id] = room;
      
      socket.emit('changeRoomResult', { room: room });
      socket.emit('listUsers', { users: _getUsers() });
    }
    
    function _handleChangeRoomRequest (room) {
      socket.leave(currentRooms[socket.id]);
      joinRoom(room);
    }
  });
}

module.exports = createChat;