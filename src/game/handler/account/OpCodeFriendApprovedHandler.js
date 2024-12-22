const Message = require("../../lib/message");

var Types = require("../../gametypes");
var Player = require("../../player");

module.exports = function handleFriendApproved(message) {
  const self = this;

  var nose = parseInt(message[1]);
  var envitando_friend = self.gameserver.getAccountById(nose);
  let ropa = [self.player.ahead, self.player.abody, self.player.aeyes, self.player.aflag, self.player.aforeground, self.player.abackground];
  let amigo_ropa = [envitando_friend.player.ahead, envitando_friend.player.abody, envitando_friend.player.aeyes, envitando_friend.player.aflag, envitando_friend.player.aforeground, envitando_friend.player.abackground];
  self.gameserver.db.putFriends(self.player.user_id, envitando_friend.player.user_id);
  self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.FRIEND_ADDED, [envitando_friend.player.game_id, amigo_ropa]));
  self.gameserver.db.putFriends(envitando_friend.player.user_id, self.player.user_id);
  envitando_friend.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.FRIEND_ADDED, [self.player.game_id, ropa]));
}
