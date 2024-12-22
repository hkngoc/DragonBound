const Message = require("../../lib/message");

var Types = require("../../gametypes");
var Player = require("../../player");

const {
  // secondsRemaining,
  // pin_code_generador,
  // getRndInteger,

  ArrayToObject,
} = require("../../utils");

module.exports = function handleGuildKick(message) {
  const self = this;

  // seguridad
  if (!self.login_complete) {
    console.log("login incomplete", opcode);
    self.connection.close();
    return null;
  }
  let guser_id = parseInt(message[1]);
  var info_prix = ArrayToObject(self.player.tournament, "start_time end_time players avatar_on max_wind force_mobile name total_games last_5_minutes_games rooms maps game_mode s1 tp save_personal save_guild min_points different_mobiles gifts gp_event turn_time".split(" "));
  if (info_prix.players === 7 && this.tournament_start_time_server <= Date.now() && this.tournament_end_time_server >= Date.now()) {
    self.sendMessage(new Message.alertResponse("Lo sentimos", "Esta opción del Guild esta bloqueada durante el torneo. Inténtalo mas tarde."));
    return null;
  }
  if (self.user_id === guser_id) {
    self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.CANT_KICK_YOURSELF, []));
  } else if (self.player.guild !== "" && self.player.guild_job === 1) {
    self.gameserver.db.kickGuild(guser_id, self.player.guild_id).then(function (data) {
      if (data.complete) {
        self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.KICKED_GUILD, []));
      }
    }).catch(function (data) {
      if (data.error_mysql || data.error_querry) {}
    });
  }
}
