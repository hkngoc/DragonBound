const Message = require("../../lib/message");

var Types = require("../../gametypes");
var Player = require("../../player");

var fs = require("fs");

module.exports = function handleGameShare(message) {
  const self = this;

  // seguridad
  if (!self.login_complete) {
    console.log("login incomplete", opcode);
    self.connection.close();
    return null;
  }
  //Logger.normal("Game Share: "+message[1]);
  if (message[1] === 2) {
    self.gameserver.db.getMyScreeRoomGameByLetters(self.player.code_screenshot_random).then(function (rows) {
      self.send([Types.SERVER_OPCODE.game_share, parseInt(message[1]), self.player.code_screenshot_random, JSON.stringify(self.player.screenshot)]);
    }).catch(function () {
      self.gameserver.db.putMyScreeRoomGame(self.player.code_screenshot_random, JSON.stringify(self.player.screenshot)).then(function (rows) {
        self.send([Types.SERVER_OPCODE.game_share, parseInt(message[1]), self.player.code_screenshot_random, JSON.stringify(self.player.screenshot)]);
      });
    });
  }
  if (message[1] === 1) {
    self.gameserver.db.getMyReplayRoomGameByLetters(self.player.code_screenshot_random).then(function (rows) {
      self.send([Types.SERVER_OPCODE.game_share, parseInt(message[1]), self.player.code_screenshot_random, JSON.stringify(self.player.screenshot)]);
    }).catch(function () {
      var avatars_ids = [];
      if (self.room) {
        self.room.forPlayers(function (account) {
          //Logger.info('Check ForPlayer #');
          if (typeof account !== "undefined") {
            if (account.player.unseen === 0) {
              var ids_avatars = [];
              ids_avatars.push(account.player.ahead);
              ids_avatars.push(account.player.abody);
              ids_avatars.push(account.player.aeyes);
              ids_avatars.push(account.player.aflag);
              avatars_ids.push(ids_avatars);
            }
          }
        });
        //Logger.cyan(self.player.view_replay);
        var date_game = {
          server: self.gameserver.id,
          create_date: Date.now(),
          room: self.room.id,
          version: 124,
          views: 0
        };
        //Logger.info([JSON.stringify(avatars_ids)]);
        self.gameserver.db.putMyReplayRoomGame(self.player.code_screenshot_random, [JSON.stringify(avatars_ids)], JSON.stringify(date_game)).then(function (rows) {
          fs.writeFile("./replays/" + self.player.code_screenshot_random + ".json", JSON.stringify(self.player.view_replay), function (err) {
            if (err) {
              throw err;
            }
            self.send([Types.SERVER_OPCODE.game_share, parseInt(message[1]), self.player.code_screenshot_random, JSON.stringify(self.player.screenshot)]);
          });
        }).catch(function (err) {
          Logger.normal("Game Share [error]: " + err.stack + " - error: " + err);
        });
      }
    });
  }
}
