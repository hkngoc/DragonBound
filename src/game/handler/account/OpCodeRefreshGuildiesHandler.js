const Message = require("../../lib/message");

var Types = require("../../gametypes");
var Player = require("../../player");

module.exports = function handleRefreshGuildies(message) {
  const self = this;

  // seguridad
  if (!self.login_complete) {
    console.log("login incomplete", opcode);
    self.connection.close();
    return null;
  }
  if (self.player.guild !== "") {
    self.gameserver.db.getGuildMembersById(self.player.guild_id).then(function (rows) {
      var my_members = rows[0];
      var my_memberss_x2 = [];
      var dato_member = "";
      my_memberss_x2.push(self.player.guild);
      my_memberss_x2.push(self.player.guild_job);
      for (var ixx in my_members) {
        var member_room = 0;
        var member_server = my_members[ixx].IsOnline;
        if (my_members[ixx].IsOnline !== 0) {
          if (self.gameserver.id === my_members[ixx].IsOnline) {
            member_server = -1;
            var my_friend_room = self.gameserver.getAccountById(parseInt(my_members[ixx].IdAcc));
            if (typeof my_friend_room !== "undefined") {
              member_room = my_friend_room.player.room_number;
            } else {
              member_room = 0;
            }
          } else {
            member_room = 0;
            //member_server = my_members[ixx].IsOnline;
            let account = self.gameserver.searchAccountById(my_members[ixx].IdAcc);
            if (account !== null) {
              member_server = account.gameserver.id;
            }
          }
        } else {
          member_room = 0;
          //member_server = my_members[ixx].IsOnline;
          let account = self.gameserver.searchAccountById(my_members[ixx].IdAcc);
          if (account !== null) {
            member_server = account.gameserver.id;
          }
        }
        dato_member = [my_members[ixx].IdAcc, my_members[ixx].game_id, my_members[ixx].gender, my_members[ixx].rank, my_members[ixx].gp, my_members[ixx].photo_url, member_server, member_room];
        my_memberss_x2.push(dato_member);
      }
      self.sendMessage(new Message.loginResponse(self));
      self.send([Types.SERVER_OPCODE.guild, my_memberss_x2]);
    }).catch(function () {
      self.send([Types.SERVER_OPCODE.guild]);
    });
  } else {
    self.send([Types.SERVER_OPCODE.guild]);
  }
}
