const Message = require("../../lib/message");

var Types = require("../../gametypes");
var Player = require("../../player");

module.exports = function handleTeamSearchCancel(message) {
  const self = this;

  if (self.room) {
    if (self.room.team_tournament_game === 1) {
      self.room.team_tournament_game = 0;
      self.room.forPlayers(function (accountdbp) {
        if (accountdbp !== null) {
          accountdbp.send([Types.SERVER_OPCODE.team_search, 0]);
        }
      });
      //self.send([Types.SERVER_OPCODE.team_search, 0]);
    }
  }
}
