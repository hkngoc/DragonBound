const Message = require("../../lib/message");

// var Types = require("../../gametypes");
// var Player = require("../../player");

module.exports = function handleGetMyAvatar(message) {
  const self = this;

  // seguridad
  if (!self.login_complete) {
    console.log("login incomplete", opcode);
    self.connection.close();
    return null;
  }

  self.gameserver.db.getPlayerAvatars(self).then(function (data) {
    if (data.error_mysql || data.error_querry) {
      //
    } else {
      var dat = self.gameserver.avatars.getAvatarDataList(data.data_list);

      self.sendMessage(new Message.myAvatars(self, dat));
    }
  });
}
