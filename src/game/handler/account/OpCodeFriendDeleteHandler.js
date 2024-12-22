const Message = require("../../lib/message");

var Types = require("../../gametypes");
var Player = require("../../player");

module.exports = function handleFriendDelete(message) {
  const self = this;

  var user_delete = parseInt(message[1]);
  self.gameserver.db.deleteFriendsByIdFriendYo(user_delete, self.player.user_id);
  self.gameserver.db.deleteFriendsByIdFriendYo(self.player.user_id, user_delete);
  self.send([40, 26]);
  self.sendMessage(new Message.loginResponse(self));
}
