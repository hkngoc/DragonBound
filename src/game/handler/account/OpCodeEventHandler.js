const Message = require("../../lib/message");

var Types = require("../../gametypes");
var Player = require("../../player");

module.exports = function handleEvent(message) {
  const self = this;

  if (!self.login_complete) {
    console.log("login incomplete", opcode);
    self.connection.close();
    return null;
  }
  let type = message[1];
  var data = [];
  if (type !== 0 && type !== 3) {
    return null;
    self.sendMessage(new Message.loginResponse(self));
  }
  let giftEvent = {
    event1: {
      cash: 400,
      gold: 2000
    },
    event2: {
      cash: 800,
      gold: 3500
    }
  };
  self.gameserver.db.getEventLogByIdAcc(self.player.user_id).then(function (e) {
    let ex = e[0][0];
    if (type === 0) {
      if (ex.Event1 - Date.now() / 1000 > 0) {
        self.player.event1 = ex.Event1 - Date.now() / 1000 < 0 ? 0 : ex.Event1 - Date.now() / 1000;
        self.sendMessage(new Message.loginResponse(self));
        return null;
      } else {
        let ti = Date.now() / 1000 + 14400;
        self.player.cash += giftEvent.event1.cash;
        self.player.gold += giftEvent.event1.gold;
        self.player.event1 = ti - Date.now() / 1000 < 0 ? 0 : ti - Date.now() / 1000;
        self.gameserver.db.eventS(1, ti, self.player.user_id).then(function (e) {}).catch(function (err) {
          //console.log("err")
        });
        self.gameserver.db.updateGoldCashEventByIdAcc(giftEvent.event1.gold, giftEvent.event1.cash, self.player.user_id);
        self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.WON_EVENT1, [giftEvent.event1.cash, giftEvent.event1.gold, data]));
        self.sendMessage(new Message.loginResponse(self));
      }
    } else if (ex.Event2 - Date.now() / 1000 > 0) {
      self.player.event2 = ex.Event2 - Date.now() / 1000 < 0 ? 0 : ex.Event2 - Date.now() / 1000;
      self.sendMessage(new Message.loginResponse(self));
      return null;
    } else {
      let ti2 = Date.now() / 1000 + 86400;
      self.player.cash += giftEvent.event2.cash;
      self.player.gold += giftEvent.event2.gold;
      self.player.event2 = ti2 - Date.now() / 1000 < 0 ? 0 : ti2 - Date.now() / 1000;
      self.gameserver.db.eventS(2, ti2, self.player.user_id).then(function (e) {}).catch(function (err) {
        //console.log("err")
      });
      self.gameserver.db.updateGoldCashEventByIdAcc(giftEvent.event2.gold, giftEvent.event2.cash, self.player.user_id);
      self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.WON_EVENT2, [giftEvent.event2.cash, giftEvent.event2.gold, data]));
      self.sendMessage(new Message.loginResponse(self));
    }
  }).catch(function (err) {
    console.log("error!");
  });
}
