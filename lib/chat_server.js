var NicknameManager = require('./nickname_manager.js');

function createChat(server) {  
  var io = require('socket.io')(server);
  var nicknames = new NicknameManager();
  var currentRooms = {};

  io.on('connection', function (socket) {
    setNickname(nicknames.generate());
    
    joinRoom('lobby');
  
    io.to(currentRooms[socket.id]).emit('userConnect', { 
      nickname: nicknames.get(socket.id)
    });
    
    socket.on('message', function (data) {
      io.to(currentRooms[socket.id]).emit('message', { 
        user: nicknames.get(socket.id),
        text: data.message
      });
    });
    
    socket.on('nicknameChangeRequest', function (data) {
      var nickname = data.nickname;
      
      if (!nicknames.isAvailable(nickname)) {
        socket.emit('nicknameChangeResult', {
          success: false,
          message: 'That nickname is already taken.'
        });
      } else if (!nicknames.isValid(nickname)) {
        socket.emit('nicknameChangeResult', {
          success: false,
          message: 'Nicknames cannot begin with "guest" and end with a number.'
        });
      } else {
        setNickname(nickname);
      }
    });
    
    socket.on('changeRoomRequest', function (data) {
      io.to(currentRooms[socket.id]).emit('userExit', {
        nickname: nicknames.get(socket.id)
      });
      
      _handleChangeRoomRequest(data.room);
      
      io.to(currentRooms[socket.id]).emit('userEnter', {
        nickname: nicknames.get(socket.id)
      });
    })

    socket.on('disconnect', function () {
      io.to(currentRooms[socket.id]).emit('userDisconnect', {
        nickname: nicknames.get(socket.id)
      });
      
      nicknames.delete(socket.id);
    });
        
    function setNickname (nickname) {
      var oldNickname = nicknames.get(socket.id);
      nicknames.set(socket.id, nickname);

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
    
    function _getUsers (){
      var userNames = [];

      for (var key in nicknames.nicknames) {
        if (currentRooms[key] === currentRooms[socket.id]) {
          userNames.push(nicknames.nicknames[key]);
        }
      }

      return userNames;
    }
    
    function joinRoom (room) {
      socket.join(room);
      currentRooms[socket.id] = room;
      
      socket.emit('listUsers', { users: _getUsers() });          
      socket.emit('changeRoomResult', { room: room });    
    }
    
    function _handleChangeRoomRequest (room) {
      socket.leave(currentRooms[socket.id]);
      joinRoom(room);
    }
  });
}

module.exports = createChat;