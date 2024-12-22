const Message = require("../../lib/message");

var Types = require("../../gametypes");
var Player = require("../../player");

module.exports = function handleEquip(message) {
  const self = this;

  // seguridad
  if (!self.login_complete) {
    console.log("login incomplete", opcode);
    self.connection.close();
    return null;
  }
  let arr_up = message[1];
  let work = false;
  for (var idx in arr_up) {
    if (typeof arr_up[idx] !== "number") {
      return null;
    }
  }
  if (arr_up.length > 0) {
    work = true;
  }
  if (self.player.gender === "m") {
    self.player.ahead = 1;
    self.player.abody = 2;
  } else {
    self.player.ahead = 3;
    self.player.abody = 4;
  }
  self.player.aeyes = 0;
  self.player.aflag = 0;
  self.player.abackground = 0;
  self.player.aforeground = 0;
  if (work) {
    self.gameserver.db.equipAvatar(arr_up, self).then(function (data) {
      if (data.error_mysql || data.error_querry) {
        // Handle errors if necessary
      } else {
        if (self.room) {
          self.gameserver.pushToRoom(self.room.id, new Message.roomPlayers(self.room), null);
        }
        self.sendMessage(new Message.loginResponse(self));
        self.player.avaDelayOne = 0;
        self.player.avaDelayTwo = 0;
        self.player.avaGold = 0;
        self.player.avaScratch = 0;
        self.player.avaLife = 0;
        self.player.avaGuard = 0;
        self.player.avaAttack = 0;
        self.player.avaShieldRegen = 0;
        self.player.updateAva([data.data.head, data.data.body, data.data.eyes, data.data.flag, data.data.background, data.data.foreground]);
        self.gameserver.sendAccountsOnline();
      }
    });
  } else {
    if (self.room) {
      self.gameserver.pushToRoom(self.room.id, new Message.roomPlayers(self.room), null);
    }
    self.sendMessage(new Message.loginResponse(self));
    self.gameserver.sendAccountsOnline();
    self.gameserver.db.defaultAvatars(self.player.reg_id, self.player.ahead, self.player.abody);
    self.player.avaDelayOne = 0;
    self.player.avaDelayTwo = 0;
    self.player.avaGold = 0;
    self.player.avaScratch = 0;
    self.player.avaLife = 0;
    self.player.avaGuard = 0;
    self.player.avaAttack = 0;
    self.player.avaShieldRegen = 0;
    self.player.updateAva([self.player.ahead, self.player.abody]);
  }
}
