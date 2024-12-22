const Message = require("../../lib/message");

var Types = require("../../gametypes");
var Player = require("../../player");

module.exports = function handleChannelRooms(message) {
  const self = this;

  // seguridad
  if (!self.login_complete) {
    console.log("login incomplete", opcode);
    self.connection.close();
    return null;
  }
  var _strtype = message[1];
  if (_strtype === "all") {
    self.gameserver.sendRoomsType(self, 0, null);
  } else if (_strtype === "waiting") {
    self.gameserver.sendRoomsType(self, 0, {
      free: true,
      status: Types.ROOM_STATUS.WAITING
    });
  } else if (_strtype === "normal") {
    self.gameserver.sendRoomsType(self, 0, {
      free: true,
      mode: Types.GAME_MODE.NORMAL
    });
  } else if (_strtype === "boss") {
    console.log("get list boss room");
    self.gameserver.sendRoomsType(self, 0, {
      free: true,
      mode: Types.GAME_MODE.BOSS
    });
  } else if (_strtype === "same") {
    self.gameserver.sendRoomsType(self, 0, {
      free: true,
      mode: Types.GAME_MODE.SAME
    });
  } else if (_strtype === "score") {
    self.gameserver.sendRoomsType(self, 0, {
      free: true,
      mode: Types.GAME_MODE.SCORE
    });
  } else if (_strtype === "next") {
    self.player.channel_rango = self.player.channel_rango + 6;
    if (self.player.channel_rango > 20) {
      self.player.channel_rango = 0;
    }
    //Logger.normal("Channel Rango Room #1: "+self.player.channel_rango);
    self.gameserver.sendRoomsType(self, self.player.channel_rango, null);
  } else if (_strtype === "prev") {
    self.player.channel_rango = self.player.channel_rango - 6;
    if (self.player.channel_rango < 0) {
      self.player.channel_rango = 0;
    }
    //Logger.normal("Channel Rango Room #2: "+self.player.channel_rango);
    self.gameserver.sendRoomsType(self, self.player.channel_rango, null);
  }

  /* case Types.CLIENT_OPCODE.channel_rooms:
    {
      // seguridad
      if (!self.login_complete) {
        console.log("login incomplete",opcode);self.connection.close();
        return null;
      }
      var _strtype = message[1];
      if (_strtype === "all" || _strtype === "waiting" || _strtype === "friends" || _strtype === "guild" ||  _strtype === "normal" || _strtype === "boss" || _strtype === "same" || _strtype === "score") {
        self.gameserver.sendRoomsTypeJc(self, 0, _strtype);
      } else if (_strtype === "next") {
        self.player.channel_rango = self.player.channel_rango + 6;
        if (self.player.channel_rango > 20)
          self.player.channel_rango = 0;
        //Logger.normal("Channel Rango Room #1: "+self.player.channel_rango);
        self.gameserver.sendRoomsTypeJc(self, self.player.channel_rango, _strtype);
      } else if (_strtype === "prev") {
        self.player.channel_rango = self.player.channel_rango - 6;
        if (self.player.channel_rango < 0)
          self.player.channel_rango = 0;
        //Logger.normal("Channel Rango Room #2: "+self.player.channel_rango);
        self.gameserver.sendRoomsTypeJc(self, self.player.channel_rango, _strtype);
      }
      break;
    } */
}
