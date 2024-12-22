const Message = require("../../lib/message");

var Types = require("../../gametypes");
var Player = require("../../player");

module.exports = function handleRoomWatch(message) {
  const self = this;

  // seguridad
  if (!self.login_complete) {
    console.log("login incomplete", opcode);
    self.connection.close();
    return null;
  }
  let room_id = message[1];
  self.gameserver.getRoomById(room_id, function (room) {
    if (room) {
      room.joinWatcher(self);
    } else {
      self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.ROOM_DOES_NOT_EXIST, []));
    }
  });
}
