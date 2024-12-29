const Message = require("../../lib/message");

var Types = require("../../gametypes");
var Player = require("../../player");

module.exports = function handleGameShoot(message) {
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
  let power = message[6];
  let time = Math.trunc(message[7] / 1000);
  let type = message[8];

  if (self.room) {
    self.player.x = x;
    self.player.y = y;
    self.player.body = body;
    self.player.look = look;

    if (self.room.game !== null) {
      if (self.player) {
        self.player.move();
        self.room.game.gameShoot(x, y, body, look, ang, power, time, type, self);
        self.sendMessage(new Message.loginResponse(self));
        //console.log("TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT");
      } else {
        self.room.game.gamePass(self);
      }
      //self.sendMessage(new Message.loginResponse(self));
    }
  }
}
