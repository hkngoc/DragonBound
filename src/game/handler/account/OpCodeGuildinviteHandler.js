const Message = require("../../lib/message");

var Types = require("../../gametypes");
var Player = require("../../player");

const {
  // secondsRemaining,
  // pin_code_generador,
  // getRndInteger,

  ArrayToObject,
} = require("../../utils");

module.exports = function handleGuildinvite(message) {
  const self = this;

  // seguridad
  if (!self.login_complete) {
    console.log("login incomplete", opcode);
    self.connection.close();
    return null;
  }
  let id = parseInt(message[1]);
  var acc = self.gameserver.getAccountById(id);
  var info_prix = ArrayToObject(self.player.tournament, "start_time end_time players avatar_on max_wind force_mobile name total_games last_5_minutes_games rooms maps game_mode s1 tp save_personal save_guild min_points different_mobiles gifts gp_event turn_time".split(" "));
  if (info_prix.players === 7 && this.tournament_start_time_server <= Date.now() && this.tournament_end_time_server >= Date.now()) {
    self.sendMessage(new Message.alertResponse("Lo sentimos", "Esta opción del Guild esta bloqueada durante el torneo. Inténtalo mas tarde."));
    return null;
  } else {
    self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.GUILD_INVITE_SENT, [acc.player.game_id]));
    if (acc) {
      if (acc.player.guild === "") {
        acc.sendMessage(new Message.GuildreqResponse(self));
      }
    }
  }
}
