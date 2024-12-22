const Message = require("../../lib/message");

var Types = require("../../gametypes");
var Player = require("../../player");

module.exports = function handleGetinfo(message) {
  const self = this;

  // seguridad
  if (!self.login_complete) {
    console.log("login incomplete", opcode);
    self.connection.close();
    return null;
  }
  let id = parseInt(message[1]);
  let acc = self.gameserver.getAccountById(id);
  if (acc) {
    self.gameserver.db.getMyFriend(self.player.user_id, acc.player.user_id).then(function (rows) {
      var my_friends = rows[0][0];
      acc.player.is_my_friend = 1;
      self.sendMessage(new Message.InfoResponse(acc));
      //Logger.info("Teste My friend 1");
    }).catch(function () {
      acc.player.is_my_friend = 0;
      self.sendMessage(new Message.InfoResponse(acc));
      //Logger.info("Teste My friend 2");
    });
  }
}
