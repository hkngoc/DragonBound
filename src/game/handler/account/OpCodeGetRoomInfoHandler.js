const Message = require("../../lib/message");

var Types = require("../../gametypes");
var Player = require("../../player");

module.exports = function handleGetRoomInfo(message) {
  const self = this;

  // seguridad
  if (!self.login_complete) {
    console.log("login incomplete", opcode);
    self.connection.close();
    return null;
  }
  let room_id = parseInt(message[1]);
  self.gameserver.getRoomById(room_id, function (room) {
    if (room) {
      self.sendMessage(new Message.extraRoomInfo(room));
    }
  });
}
