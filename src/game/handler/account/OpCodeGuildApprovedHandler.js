const Message = require("../../lib/message");

var Types = require("../../gametypes");
var Player = require("../../player");

module.exports = function handleGuildApproved(message) {
  const self = this;

  // seguridad
  if (!self.login_complete) {
    console.log("login incomplete", opcode);
    self.connection.close();
    return null;
  }
  let id = parseInt(message[1]);
  if (self.player.guild === "") {
    self.gameserver.db.joinGuild(self, id).then(function (data) {
      if (data.good) {
        self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.JOINED_GUILD, []));
        if (self.room) {
          self.gameserver.pushToRoom(self.room.id, new Message.roomPlayers(self.room), null);
        }
      }
    }).catch(function (data) {
      if (data.error_mysql || data.error_querry) {} else if (data.error_exist) {}
    });
  }
}
