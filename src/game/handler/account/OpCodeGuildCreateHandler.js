const Message = require("../../lib/message");

var Types = require("../../gametypes");
var Player = require("../../player");

const {
  // secondsRemaining,
  // pin_code_generador,
  // getRndInteger,

  ArrayToObject,
} = require("../../utils");

module.exports = function handleGuildCreate(message) {
  const self = this;

  // seguridad
  if (!self.login_complete) {
    console.log("login incomplete", opcode);
    self.connection.close();
    return null;
  }
  let gname = message[1];
  var info_prix = ArrayToObject(self.player.tournament, "start_time end_time players avatar_on max_wind force_mobile name total_games last_5_minutes_games rooms maps game_mode s1 tp save_personal save_guild min_points different_mobiles gifts gp_event turn_time".split(" "));
}
