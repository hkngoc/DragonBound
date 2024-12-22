const Message = require("../../lib/message");

var Types = require("../../gametypes");
var Player = require("../../player");

module.exports = function handleGameMove(message) {
  const self = this;

  // seguridad
  if (!self.login_complete) {
    console.log("login incomplete", opcode);
    self.connection.close();
    return null;
  }
  var _x = message[1];
  var _y = message[2];
  var _body = message[3];
  var _look = message[4];
  var _ang = message[5];
  var _time = message[6];
  if (self.room) {
    self.player.x = _x;
    self.player.y = _y;
    self.player.body = _body;
    self.player.look = _look;
    self.player.ang = _ang;
    self.player.move();
    self.gameserver.pushToRoom(self.room.id, new Message.gameUpdate(self));
  }
}
