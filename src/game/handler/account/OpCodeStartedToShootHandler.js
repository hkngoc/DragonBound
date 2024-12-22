const Message = require("../../lib/message");

var Types = require("../../gametypes");
var Player = require("../../player");

module.exports = function handleStartedToShoot(message) {
  const self = this;

  // seguridad
  if (!self.login_complete) {
    console.log("login incomplete", opcode);
    self.connection.close();
    return null;
  }
  self.player.shotType = message[1];
}
