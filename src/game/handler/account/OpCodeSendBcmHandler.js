const Message = require("../../lib/message");

var Types = require("../../gametypes");
// var Player = require("../../player");

module.exports = function handleSendBcm(message) {
  const self = this;

  // seguridad
  if (!self.login_complete) {
    console.log("login incomplete", opcode);
    self.connection.close();
    return null;
  }
  let _msj = message[1];
  if (self.player.is_muted === true || self.player.is_muted >= Date.now()) {
    self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.MUTED, []));
    return null;
  } else if (self.player.megaphones === 0) {
    self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.NEED_ITEM, [894, 1, 0, "Megaphone / Horn / Bugle [ExItem]"]));
    return null;
  } else if (self.player.rank < 15) {
    self.sendMessage(new Message.alertResponse("Hola " + this.player.game_id, "Tu Nivel <span class='span_rank rank rank" + self.player.rank + "'></span> Es Muy Bajo Para Utilizar El MegaPhone, El Nivel Especial Debe De Ser Mayor <span class='span_rank rank rank15'></span> Para Que Lo Puedas Utilizar"));
    return null;
  } /*else if (self.gameserver.name === 'Prix' && this.player.gm === 0 && self.player.server_tournament_state === 0) {
      self.sendMessage(new Message.alertResponse("Hola "+this.player.game_id, "El Chat en el Lobby esta prohibido para los usuarios."));
      return null;
    }*/else if (_msj.length > 150) {} else if (self.player.megaphones > 0) {
    _msj = _msj.replace("<", "");
    _msj = _msj.replace(">", "");
    _msj = _msj.replace("alert", "");
    _msj = _msj.replace("\\", "");
    _msj = _msj.replace("//", "");
    _msj = _msj.replace("%", "");
    let data = new Message.chatResponse(self, _msj, Types.CHAT_TYPE.BUGLE);
    self.gameserver.pushBroadcast(data);
    self.gameserver.chathistory.push(["(rank" + self.player.rank + ") " + self.player.game_id + "] " + _msj + "", "", Types.CHAT_TYPE.BUGLE]);
    try {
      if (self.gameserver.master_ready === true) {
        let ps = data.serialize();
        self.gameserver.master.send(JSON.stringify([1, ps]));
      }
    } catch (e) {
      Logger.error(e.stack);
    }
    /*self.gameserver.db.updateMegaphone(-1, self.player.user_id).then(() => {
      self.player.megaphones -= 1;
     }); */
    self.sendMessage(new Message.loginResponse(self));
    /*self.gameserver.db.UpdateAvatarAmountBuggle(self.player.user_id).then(() => {}); */
  } else {
    self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.NEED_ITEM, [894, 1, 0, "Megaphone / Horn / Bugle [ExItem]"]));
  }
  self.gameserver.db.getMegaphone(self.user_id, function (Megaphone) {
    if (!Megaphone > 0) {
      return false;
    }
    self.gameserver.db.reduceMegaphone(self.user_id, function () {
      if (!(Megaphone - 1 > 0)) {
        self.gameserver.db.removeMegaphone(self.user_id, function () {
          self.sendMessage(new Message.loginResponse(self));
          self.gameserver.db.getPlayerAvatars(self).then(function (data) {
            if (data.error_mysql || data.error_querry) {} else {
              var dat = self.gameserver.avatars.getAvatarDataList(data.data_list);
              self.sendMessage(new Message.myAvatars(self, dat));
            }
          });
        });
      } else {
        self.sendMessage(new Message.loginResponse(self));
        self.gameserver.db.getPlayerAvatars(self).then(function (data) {
          if (data.error_mysql || data.error_querry) {} else {
            var dat = self.gameserver.avatars.getAvatarDataList(data.data_list);
            self.sendMessage(new Message.myAvatars(self, dat));
          }
        });
      }
    });
  });
}
