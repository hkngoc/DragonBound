const Message = require("../../lib/message");

var Types = require("../../gametypes");
var Player = require("../../player");

module.exports = function handleRelationshipChange(message) {
  const self = this;

  var rel_tip = message[1];
  var rel_id = message[2];
  let player2 = self.gameserver.getAccountById(rel_id);
  let ropa = [self.player.ahead, self.player.abody, self.player.aeyes, self.player.aflag, self.player.aforeground, self.player.abackground];
  let Ava_break = 0;
  self.gameserver.db.getUserAvatarsByIdAcc(self.player.user_id).then(function (rowss) {
    var avatar_user = rowss[0];
    var valido = false;
    for (var xm in avatar_user) {
      /*if (avatar_user[xm].aId != 1060) {
          self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.NEED_ITEM, [1060, 1, 0, 'Rose (get relationship)']));
          return null;
        }
        if (avatar_user[xm].aId != 1063) {
          self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.NEED_ITEM, [1063, 1, 0, 'Tissue (break friendship)']));
          return null;
        }*/
      if (rel_tip === "f") {
        if (avatar_user[xm].aId === 1060) {
          self.send([40, 76, player2.player.game_id]);
          player2.send([44, [rel_tip, self.player.user_id, self.player.game_id, ropa, "hi"]]);
        } /* else {
            self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.NEED_ITEM, [1060, 1, 0, 'Rose (get relationship)']));
            return null;
          }*/
      }
      if (rel_tip === "e") {
        if (avatar_user[xm].aId === 1061) {
          self.send([40, 76, player2.player.game_id]);
          player2.send([44, [rel_tip, self.player.user_id, self.player.game_id, ropa, "hi"]]);
        } /* else {
            self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.NEED_ITEM, [1061, 1, 0, 'Engagement Ring']));
            return null;
          }*/
      }
      if (rel_tip === "m") {
        if (avatar_user[xm].aId === 1062) {
          self.send([40, 76, player2.player.game_id]);
          player2.send([44, [rel_tip, self.player.user_id, self.player.game_id, ropa, "hi"]]);
        }
        /*if (avatar_user[xm].aId !== 1062) {
            self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.NEED_ITEM, [1062, 1, 0, 'Marriage Ring']));
            return null;
          }*/
      }
      if (rel_tip === "s") {
        if (self.player.relationship_status === "f") {
          if (avatar_user[xm].aId === 1063) {
            valido = true;
            Ava_break = 1063;
          } /* else {
              self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.NEED_ITEM, [1063, 1, 0, 'Tissue (break friendship)']));
              return null;
            }*/
        }
        if (self.player.relationship_status === "e") {
          if (avatar_user[xm].aId === 1064) {
            valido = true;
            Ava_break = 1064;
          } /* else {
              self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.NEED_ITEM, [1064, 1, 0, 'Hammer (break engagement)']));
              return null;
            }*/
        }
        if (self.player.relationship_status === "m") {
          if (avatar_user[xm].aId === 1065) {
            valido = true;
            Ava_break = 1065;
          } /* else {
              self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.NEED_ITEM, [1065, 1, 0, 'Lawyer (break marriage)']));
              return null;
            }*/
        }
        if (valido) {
          var name_ava_gift = self.gameserver.avatars.getAvatagift(Ava_break);
          self.gameserver.pushBroadcastChat(new Message.chatResponse(self, "</3 Has usado el item \"" + name_ava_gift + " [ExItem]\" para terminar con " + self.player.relationship_with_name + ", ahora estás soltero(a) de nuevo, Mejor suerte en tu próxima relación, hay muchos peces en el mar... :(", Types.CHAT_TYPE.SYSTEM), self.room);
          self.gameserver.db.deleteAvatarByUserID(self.player.user_id, Ava_break);
          self.gameserver.db.updateEndRelationByIdAcc("s", 0, self.player.user_id);
          self.gameserver.db.updateEndRelationByIdAcc("s", 0, self.player.relationship_with_id);
          //----------------------------------------------------------//
          self.player.relationship_status = rel_tip; //'s';
          self.player.relationship_with_id = 0;
          self.player.relationship_with_rank = 0;
          self.player.relationship_with_photo = "";
          self.player.relationship_with_name = "";
          self.player.relationship_with_gender = "";
          //----------------------------------------------------------//
          if (typeof player2 !== "undefined") {
            player2.player.relationship_status = rel_tip; //'s';
            player2.player.relationship_with_id = 0;
            player2.player.relationship_with_rank = 0;
            player2.player.relationship_with_photo = "";
            player2.player.relationship_with_name = "";
            player2.player.relationship_with_gender = "";
          }
          //----------------------------------------------------------//
          self.sendMessage(new Message.loginResponse(self));
          self.gameserver.sendAccountsOnline();
          if (typeof player2 !== "undefined") {
            player2.sendMessage(new Message.loginResponse(player2));
            player2.gameserver.sendAccountsOnline();
          }
          //==========================================================//
          self.room.RoomUpdate(self);
          if (typeof player2 !== "undefined") {
            self.room.RoomUpdate(player2);
          }
        }
      }
    }
  });
}
