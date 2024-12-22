const Message = require("../../lib/message");

var Types = require("../../gametypes");
var Player = require("../../player");

module.exports = function handleSelectBot(message) {
  const self = this;

  // seguridad
  if (!self.login_complete) {
    console.log("login incomplete", opcode);
    self.connection.close();
    return null;
  }
  const positionOfBot = message[1];
  const deleteBot = message[2] == -1;
  const bot_id = message[2];
  ///console.log(self.user_id,bot_id,self.player.unlock);
  if (self.room && self.player.is_master) {
    if (self.room.team_bots_count <= 4) {
      if (deleteBot) {
        const newBots = self.room.accountsOfBot.filter(data => data.position != positionOfBot);
        let positions = [1, 3, 5, 7];
        for (let n in newBots) {
          newBots[n].position = positions[n];
        }
        self.room.accountsOfBot = [];
        self.room.resetBot();
        newBots.map(data => {
          self.onCreateBot({
            positionOfBot: data.position,
            bot_id: data.id
          });
        });
      } else {
        const account_exist = self.room.accountsOfBot.filter(data => data.id == bot_id);
        const bot_exist = account_exist.length > 0;
        if (bot_exist) {
          self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.ALREADY_IN_ROOM, []));
        } else if (positionOfBot == 1 && self.room.accountsOfBot.length == 1) {
          self.room.resetBot();
          self.room.accountsOfBot = [];
          let changeDataBot = {
            positionOfBot: 1,
            bot_id: bot_id
          };
          if (bot_id > self.player.unlock) {
            self.send([Types.SERVER_OPCODE.alert2, 12, [10, 26]]);
          } else {
            self.onCreateBot(changeDataBot);
          }
        } else {
          let newDataBot = {
            positionOfBot,
            bot_id
          };
          if (bot_id > self.player.unlock) {
            self.send([Types.SERVER_OPCODE.alert2, 12, [10, 26]]);
          } else {
            self.onCreateBot(newDataBot);
          }
        }
      }
    }
  }
}
