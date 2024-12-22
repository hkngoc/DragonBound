const Message = require("../../lib/message");

var Types = require("../../gametypes");
var Player = require("../../player");

const {
  // secondsRemaining,
  // pin_code_generador,
  // getRndInteger,

  ArrayToObject,
} = require("../../utils");

module.exports = function handleGuildLeave(message) {
  const self = this;

  // seguridad
  if (!self.login_complete) {
    console.log("login incomplete", opcode);
    self.connection.close();
    return null;
  }
  var info_prix = ArrayToObject(self.player.tournament, "start_time end_time players avatar_on max_wind force_mobile name total_games last_5_minutes_games rooms maps game_mode s1 tp save_personal save_guild min_points different_mobiles gifts gp_event turn_time".split(" "));
  if (info_prix.players === 7 && this.tournament_start_time_server <= Date.now() && this.tournament_end_time_server >= Date.now()) {
    self.sendMessage(new Message.alertResponse("Lo sentimos", "Esta opción del Guild esta bloqueada durante el torneo. Inténtalo mas tarde."));
    return null;
  }
  if (self.player.guild !== "" && self.player.guild_job === 0 || self.player.guild !== "" && self.player.guild_job === 2) {
    self.gameserver.db.leaveGuild(self.player.user_id).then(function (data) {
      if (data.complete) {
        self.player.guild = "";
        self.player.guild_job = 0;
        self.player.guild_id = 0;
        if (self.room) {
          self.gameserver.pushToRoom(self.room.id, new Message.roomPlayers(self.room), null);
        } else {
          self.sendMessage(new Message.loginResponse(self));
          self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.LEFT_GUILD, []));
        }
        self.gameserver.sendAccountsOnline();
      }
    }).catch(function (data) {
      if (data.error_mysql || data.error_querry) {}
    });
  }
  if (self.player.guild_job === 1) {
    self.gameserver.db.DeleteNameGuild(self.player.guild, self.player.guild_id).then(function (data) {
      if (data.complete) {
        self.player.guild = "";
        self.player.guild_job = 0;
        self.player.guild_id = 0;
        if (self.room) {
          self.gameserver.pushToRoom(self.room.id, new Message.roomPlayers(self.room), null);
        } else {
          self.sendMessage(new Message.loginResponse(self));
          self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.CLOSED_GUILD, []));
        }
        self.gameserver.sendAccountsOnline();
      }
    }).catch(function (data) {
      if (data.error_mysql || data.error_querry) {}
    });
  }
}
