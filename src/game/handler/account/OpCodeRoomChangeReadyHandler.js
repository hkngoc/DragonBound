const Message = require("../../lib/message");

var Types = require("../../gametypes");
var Player = require("../../player");

module.exports = function handleRoomChangeReady(message) {
  const self = this;

  // seguridad
  if (!self.login_complete) {
    console.log("login incomplete", opcode);
    self.connection.close();
    return null;
  }
  let status = message[1];
  self.player.is_ready = status === true ? 1 : 0;
  if (self.room) {
    self.gameserver.pushToRoom(self.room.id, new Message.changedReady(self));
    //self.room.masterTime();
  }
}
