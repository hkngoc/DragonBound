const Message = require("../../lib/message");

var Types = require("../../gametypes");
var Player = require("../../player");

module.exports = function handleTab(message) {
  const self = this;

  // seguridad
  if (!self.login_complete) {
    /*self.connection.close();
      return null;*/
    var trys = 0;
    function check_ready() {
      if (trys < 400) {
        if (self.login_complete) {
          self.Handler(arguments);
        } else {
          setTimeout(check_ready, 10);
          trys++;
        }
      }
    }
    check_ready();
    return null;
  }
  let slot = message[1];
  if (slot === 0) {
    //channel
  } else if (slot === 1) {
    self.gameserver.db.getFriendsByIdyo(self.player.user_id).then(function (rows) {
      var my_friends = rows[0];
      var my_friends_x2 = [];
      var dato_frind = "";
      for (var ix in my_friends) {
        var friend_room = 0;
        if (my_friends[ix].IsOnline !== 0) {
          if (self.gameserver.id === my_friends[ix].IsOnline) {
            var my_friend_room = self.gameserver.getAccountById(parseInt(my_friends[ix].IdAcc));
            if (typeof my_friend_room !== "undefined") {
              friend_room = my_friend_room.player.room_number;
            } else {
              friend_room = 0;
            }
          } else {
            friend_room = 0;
          }
        } else {
          friend_room = 0;
        }
        var fserver = 0;
        let account = self.gameserver.searchAccountById(my_friends[ix].IdAcc);
        if (account !== null) {
          fserver = account.gameserver.id;
        }
        dato_frind = [my_friends[ix].IdAcc, my_friends[ix].gp, my_friends[ix].game_id, my_friends[ix].photo_url, "b" + my_friends[ix].rank + "c" + fserver + "d" + friend_room];
        my_friends_x2.push(dato_frind);
      }
      //self.sendMessage(new Message.loginResponse(self));
      self.send([Types.SERVER_OPCODE.friends, my_friends_x2, self.gameserver.id, parseInt(my_friends.length + 1)]);
    }).catch(function () {
      self.send([Types.SERVER_OPCODE.friends, [], self.gameserver.id, 1]);
    });
  } else if (slot === 2) {
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
        //self.sendMessage(new Message.loginResponse(self));
        self.send([Types.SERVER_OPCODE.guild, my_memberss_x2]);
      }).catch(function () {
        self.send([Types.SERVER_OPCODE.guild]);
      });
    } else {
      self.send([Types.SERVER_OPCODE.guild]);
    }
  }
}
