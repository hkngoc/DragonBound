const Message = require("../../lib/message");

var Types = require("../../gametypes");
var Player = require("../../player");

module.exports = function handleUseExitem(message) {
  const self = this;

  if (!self.login_complete) {
    console.log("login incomplete", opcode);
    self.connection.close();
    return null;
  }
  // console.log(message[1],self.player.lucky_egg,self.player.lucky_egg_sec_left,Date.now());
  if (message[1] === "lucky_egg") {
    self.gameserver.db.getLuckyEggs(self.user_id, function (lucky_eggs) {
      if (!lucky_eggs > 0) {
        return false;
      }
      self.gameserver.db.reduceLuckyEgg(self.user_id, function () {
        if (self.lucky_egg_left() > 0) {
          self.lucky_egg_sec_left += 3600000;
        } else {
          self.lucky_egg_start = Date.now();
          self.lucky_egg_sec_left = 3600000;
        }
        /*var lucky_egg_finish = self.player.lucky_egg-Date.now() > 0 ? parseInt(self.player.lucky_egg)+36e+5 : Date.now()+36e+5;
                      self.gameserver.db.updateLuckyEggFinish(lucky_egg_finish, self.player.user_id);
                      self.player.lucky_egg_sec_left -= 1;
                      self.player.lucky_egg = lucky_egg_finish;*/
        if (!(lucky_eggs - 1 > 0)) {
          self.gameserver.db.removeLuckyEgg(self.user_id, function () {
            self.sendMessage(new Message.loginResponse(self));
            self.gameserver.db.getPlayerAvatars(self).then(function (data) {
              if (data.error_mysql || data.error_querry) {} else {
                var dat = self.gameserver.avatars.getAvatarDataList(data.data_list);
                self.sendMessage(new Message.myAvatars(self, dat));
              }
            });
          });
        } else {
          self.sendMessage(new Message.loginResponse(self));
          self.gameserver.db.getPlayerAvatars(self).then(function (data) {
            if (data.error_mysql || data.error_querry) {} else {
              var dat = self.gameserver.avatars.getAvatarDataList(data.data_list);
              self.sendMessage(new Message.myAvatars(self, dat));
            }
          });
        }
      });
    });
  }
}
