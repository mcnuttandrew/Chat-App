function NicknameManager () {
  this.guestNumber = 1;
  this.nicknames = {};
}

NicknameManager.prototype.get = function (id) {
  return this.nicknames[id];
};

NicknameManager.prototype.set = function (id, nickname) {
  this.nicknames[id] = nickname;
};

NicknameManager.prototype.delete = function (id) {
  delete this.nicknames[id];
};

NicknameManager.prototype.generate = function () {
  return 'guest' + this.guestNumber++;
};

NicknameManager.prototype.isAvailable = function (nickname) {
  for (var key in this.nicknames) {
    if (this.nicknames[key] === nickname) {
      return false;
    }
  }
  return true;
};

NicknameManager.prototype.isValid = function (nickname) {
  return !nickname.match(/guest\d{0,}/);
};

module.exports = NicknameManager;