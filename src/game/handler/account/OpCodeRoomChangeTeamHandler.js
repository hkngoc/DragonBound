const Message = require("../../lib/message");

var Types = require("../../gametypes");
var Player = require("../../player");

module.exports = function handleRoomChangeTeam(message) {
  const self = this;

  // seguridad
  if (!self.login_complete) {
    console.log("login incomplete", opcode);
    self.connection.close();
    return null;
  }
  if (self.room) {
    if (self.room.search_team_room === 0) {
      self.room.changeTeam(self);
    }
  }
}
