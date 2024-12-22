const Message = require("../../lib/message");

var Types = require("../../gametypes");
var Player = require("../../player");

var ignoreCase = require("ignore-case");

module.exports = function handleChangeName(message) {
  const self = this;

  // seguridad
  if (!self.login_complete) {
    console.log("login incomplete", opcode);
    self.connection.close();
    return null;
  }
  var fuck = false;
  var _nname = message[1];
  if ((_nname.length > 0 && _nname.length <= 25) === false) {
    return null;
  }
  if (ignoreCase.startsWith(_nname, " ")) {
    self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.NAME_BAD_CHAR, []));
    return null;
  }
  if (ignoreCase.endsWith(_nname, " ")) {
    self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.NAME_BAD_CHAR, []));
    return null;
  }
  if (ignoreCase.startsWith(_nname, "GM") || ignoreCase.startsWith(_nname, "BattleFunny")) {
    fuck = true;
  }
  if (!fuck) {
    for (let i = 0; i < Types.GAME_ID.length; i++) {
      if (ignoreCase.equals(_nname, Types.GAME_ID[i])) {
        //fuck = true;
        self.sendMessage(new Message.alertResponse("Prohibited", "you are prohibited from changing your game nickname"));
        return null;
      }
    }
  }
  if (self.player.gm === 1) {
    fuck = false;
  }
  if (fuck) {
    self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.NAME_BAD_CHAR, []));
  } else if (_nname.length < 25) {
    //if (self.player.user_id === 99) {
    //    self.sendMessage(new Message.alertResponse("Prohibited", "you are prohibited from changing your game nickname"));
    //    return null;
    //}
    self.gameserver.db.changeName(_nname, self).then(function (data) {
      if (data.change) {
        self.player.game_id = _nname;
        self.sendMessage(new Message.loginResponse(self));
        self.gameserver.sendAccountsOnline();
      }
    }).catch(function (data) {
      if (data.error_mysql || data.error_querry) {
        self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.NAME_BAD_CHAR, []));
      } else if (data.error_exist) {
        self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.NAME_ALREADY_EXISTS, []));
      } else if (data.error_cash) {
        self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.NAME_NOT_ENOUGH_CASH, []));
      }
    });
  } else {
    self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.NAME_BAD_LEN, []));
  }
}
