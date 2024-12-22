const Message = require("../../lib/message");

var Types = require("../../gametypes");
var Player = require("../../player");

module.exports = function handleTournamentCancelWait(message) {
  const self = this;

  if (self.player.tournament_wait_game == 1) {
    self.player.tournament_wait_game = 0;
  }
}
