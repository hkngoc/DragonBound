const Message = require("../../lib/message");

var Types = require("../../gametypes");
var Player = require("../../player");

module.exports = function handleMobile(message) {
  const self = this;

  // seguridad
  if (!self.login_complete) {
    console.log("login incomplete", opcode);
    self.connection.close();
    return null;
  }
  var _mob = message[1];
  if (self.room) {
    if (typeof Types.MOBILES[_mob] != "undefined" && Types.MOBILES[_mob] !== null) {
      if (self.player.is_master === 1 && self.room.game_mode === Types.GAME_MODE.SAME) {
        self.room.forPlayers(function (accountdbp) {
          if (accountdbp !== null) {
            var prohivido = true;
            if (self.player.rank < 26 || self.player.rank === 27 || self.player.rank === 28 || self.player.rank === 29 || self.player.rank === 30) {
              if (_mob == Types.MOBILE.COPYLOID || _mob == Types.MOBILE.BEE) {
                prohivido = false;
              }
            }
            if (prohivido) {
              if (_mob == Types.MOBILE.RANDOM) {
                self.player.random_mobil = 1;
                accountdbp.player.random_mobil = 1;
              } else if (_mob == Types.MOBILE.BEE) {
                _mob = 1;
                self.send([17, "¡Locked!", "No tienes permitido realizar esta función."]);
              } else {
                self.player.random_mobil = 0;
                accountdbp.player.random_mobil = 0;
              }
              accountdbp.player.mobile = _mob;
              self.gameserver.pushToRoom(self.player.room_number, new Message.changedMobile(accountdbp));
              return null;
            } else {
              self.player.mobile = Types.MOBILE.ARMOR;
              accountdbp.player.mobile = Types.MOBILE.ARMOR;
              self.gameserver.pushToRoom(self.room.id, new Message.changedMobile(self));
              self.gameserver.pushToRoom(self.room.id, new Message.changedMobile(accountdbp));
              return null;
            }
          }
        });
      }
    }
    if (typeof Types.MOBILES[_mob] != "undefined" && Types.MOBILES[_mob] !== null) {
      if (_mob == Types.MOBILE.RANDOM) {
        self.player.random_mobil = 1;
      } else {
        self.player.random_mobil = 0;
      }
      self.player.mobile = _mob;
      self.gameserver.pushToRoom(self.room.id, new Message.changedMobile(self));
    }
    if (self.player.rank < 26 || self.player.rank === 27 || self.player.rank === 28 || self.player.rank === 29 || self.player.rank === 30) {
      if (_mob == Types.MOBILE.COPYLOID) {
        self.sendMessage(new Message.alertResponse("Non-Selectable Mobile", "You can not select this mobile."));
        self.player.mobile = Types.MOBILE.ARMOR;
        self.gameserver.pushToRoom(self.room.id, new Message.changedMobile(self));
        return null;
      }
    }
  }
}
