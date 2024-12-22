const Message = require("../../lib/message");

var Types = require("../../gametypes");
var Player = require("../../player");

module.exports = function handleChannelJoin(message) {
  const self = this;

  // seguridad
  if (!self.login_complete) {
    console.log("login incomplete", opcode);
    self.connection.close();
    return null;
  }

  self.location_type = Types.LOCATION.CHANNEL;

  if (self.room) {
    if (self.room.watchers[self.user_id]) {
      self.room.removeWatcher(self);
      return null;
    }

    if (self.room.status !== null && self.room.status == Types.ROOM_STATUS.PLAYING) {
      if (self.gameserver.name === "Holiday") {
        self.player.gm_probability = 0;
        self.gameserver.db.updateProbability(0, self.player.user_id);
      } else if (self.gameserver.name === "Prix") {
        self.player.punts_prix_user -= 1;
        self.sendMessage(new Message.loginResponse(self));
        self.gameserver.db.updatePrix(self.player.punts_prix_user, self).then(function (data) {
          if (data.error_mysql || data.error_querry) {} else {
            //Logger.info('You have escaped from the game');
          }
        });
      }

      self.gameserver.db.updateLeftByIdAcc(1500, 5, 1, self.player.user_id);

      //Logger.info('User: '+self.player.game_id+' has left the Room: '+self.room_number);
      /* if (self.room.game) {
        if (self.room.player_count === 2) {
          self.room.game.checkDead();
        } else if (self.room.player_count > 2) {
          self.room.game.gamePass(self);
        }
      } */
      //self.gameserver.pushBroadcastChat(new Message.chatResponse(self, "Player "+self.player.game_id+" left the room.", Types.CHAT_TYPE.SYSTEM), self.room);
      //self.gameserver.pushBroadcastChat(new Message.chatResponse(self, "Winning Bonus: Team A = %% GP, Team B = %% GP.", Types.CHAT_TYPE.SYSTEM), self.room);
    }
    self.room.removePlayer(self);
    self.sendMessage(new Message.loginResponse(self));
    self.player.is_ready = 0;
    self.player.is_master = 0;
    self.player.room_number = 0; /*mirar*/
  }

  self.gameserver.sendAccountsOnline();

  if (self.gameserver.server_subtype !== 3) {
    /* self.gameserver.forEachAccount(function (account_rooms) {
      if (account_rooms !== null) {
        account_rooms.gameserver.sendRooms(account_rooms);
        account_rooms.sendMessage(new Message.loginResponse(account_rooms));
      }
    }); */

    self.gameserver.sendRooms(self);

    if (self.player.random_mobil === parseInt(1)) {
      self.player.mobile = Types.MOBILE.RANDOM;
    }
  }

  self.player.room_number = 0;
  self.sendMessage(new Message.loginResponse(self));
}
