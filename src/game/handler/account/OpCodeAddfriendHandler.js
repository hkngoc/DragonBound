const Message = require("../../lib/message");

var Types = require("../../gametypes");
var Player = require("../../player");

module.exports = function handleAddfriend(message) {
  const self = this;

  // seguridad
  if (!self.login_complete) {
    console.log("login incomplete", opcode);
    self.connection.close();
    return null;
  }
  /*if (self.player.block_friend === 0) {*/
  let agregar = parseInt(message[1]);
  let amigo_id = self.gameserver.getAccountById(agregar);
  if (self.player.rank < 26 && amigo_id.player.rank === 26 || self.player.rank < 26 && amigo_id.player.rank === 27 || self.player.rank < 26 && amigo_id.player.rank === 31) {
    self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.CANT_FRIEND_GM, []));
    return null;
  }
  let ropa = [self.player.ahead, self.player.abody, self.player.aeyes, self.player.aflag, self.player.aforeground, self.player.abackground];
  amigo_id.send([Types.SERVER_OPCODE.friendreq, [self.player.user_id, self.player.game_id, ropa]]);
  self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.FRIEND_REQUEST_SENT, [amigo_id.player.game_id]));
  /*} else {
      self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.ADD_FRIEND_OFFLINE, []));
    }*/
}
