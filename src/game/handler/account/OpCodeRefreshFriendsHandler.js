const Message = require("../../lib/message");

var Types = require("../../gametypes");
var Player = require("../../player");

module.exports = function handleRefreshFriends(message) {
  const self = this;

  // seguridad
  if (!self.login_complete) {
    console.log("login incomplete", opcode);
    self.connection.close();
    return null;
  }
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
}
