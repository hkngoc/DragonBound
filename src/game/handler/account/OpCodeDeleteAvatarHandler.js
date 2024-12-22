const Message = require("../../lib/message");

var Types = require("../../gametypes");
var Player = require("../../player");

module.exports = function handleDeleteAvatar(message) {
  const self = this;

  // seguridad
  if (!self.login_complete) {
    console.log("login incomplete", opcode);
    self.connection.close();
    return null;
  }
  let id = parseInt(message[1]);
  self.gameserver.db.selectItemDetail(id).then(function (data) {
    let item = data[0][0].aId;
    if (item == 894) {
      self.gameserver.db.DeleteAvatarX(self.player.user_id, 5).then(() => {});
      self.player.megaphones = 0;
    } else if (item == 464) {
      self.gameserver.db.DeleteAvatarX(self.player.user_id, 1).then(() => {});
      self.player.power_user = 0;
      self.sendMessage(new Message.loginResponse(self));
    } else if (item == 893) {
      self.gameserver.db.DeleteAvatarX(self.player.user_id, 2).then(() => {});
      self.player.plus10gp = 0;
      self.sendMessage(new Message.loginResponse(self));
    } else if (item == 1223) {
      self.gameserver.db.DeleteAvatarX(self.player.user_id, 3).then(() => {});
      self.player.maps_pack = 0;
      if (self.player.is_master === 1) {
        self.room.map = -1;
        self.room.RoomUpdate(self);
      }
      self.sendMessage(new Message.loginResponse(self));
    } else if (item == 895) {
      self.gameserver.db.DeleteAvatarX(self.player.user_id, 4).then(() => {});
      self.player.mobile_fox = 0;
      self.player.mobile = 0;
      self.gameserver.pushToRoom(self.room.id, new Message.changedMobile(self));
      self.sendMessage(new Message.loginResponse(self));
    }
  }).catch(function (err) {
    console.log("error :)");
  });
  self.gameserver.db.deleteAvatarById(id).then(function (data) {
    if (data.error_mysql || data.error_querry) {} else {
      self.gameserver.db.getPlayerAvatars(self).then(function (data) {
        if (data.error_mysql || data.error_querry) {} else {
          var dat = self.gameserver.avatars.getAvatarDataList(data.data_list);
          self.sendMessage(new Message.myAvatars(self, dat));
        }
      });
      self.send([40, 78]);
    }
  });
}
