// const Message = require("../../lib/message");

var Types = require("../../gametypes");
// var Player = require("../../player");

module.exports = function handleGetAvatar(message) {
  const self = this;

  let _id = message[1];
  var data = self.gameserver.avatars.getAvatar(_id);

  if (data !== null) {
    self.send([Types.SERVER_OPCODE.avatar_info, _id, data]);
  }
}
