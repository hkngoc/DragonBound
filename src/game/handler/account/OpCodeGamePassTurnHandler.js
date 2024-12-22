const Message = require("../../lib/message");

var Types = require("../../gametypes");
var Player = require("../../player");

module.exports = function handleGamePassTurn(message) {
  const self = this;

  // seguridad
  if (!self.login_complete) {
    console.log("login incomplete", opcode);
    self.connection.close();
    return null;
  }
  let x = message[1];
  let y = message[2];
  let body = message[3];
  let look = message[4];
  let ang = message[5];
  let _time1 = message[6];
  if (self.room) {
    self.player.x = x;
    self.player.y = y;
    self.body = body;
    self.player.look = look;
    self.player.ang = ang;
    //console.log("user gamepass");
    self.room.game.gamePass(self);
  }
}
