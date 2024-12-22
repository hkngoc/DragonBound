const Message = require("../../lib/message");

var Types = require("../../gametypes");
var Player = require("../../player");

module.exports = function handleRelationshipApproved(message) {
  const self = this;

  var new_rel_status = message[1];
  var from_id = message[2];
  let player2 = self.gameserver.getAccountById(from_id);
  var casar = false;
  if (new_rel_status === "f") {
    //Enamorados
    casar = true;
    self.gameserver.pushBroadcast(new Message.chatResponse(self, "[" + self.player.game_id + " & " + player2.player.game_id + "] <3 Nueva Pareja <3 [Server " + self.gameserver.id + " Room " + self.room.id + "]", Types.CHAT_TYPE.LOVE));
    self.gameserver.db.deleteAvatarByUserID(player2.player.user_id, 1060);
  }
  if (new_rel_status === "e") {
    //Comprometidos
    casar = true;
    self.gameserver.pushBroadcast(new Message.chatResponse(self, "[" + self.player.game_id + " & " + player2.player.game_id + "] <3<3 Comprometidos <3<3 [Server " + self.gameserver.id + " Room " + self.room.id + "]", Types.CHAT_TYPE.LOVE));
    self.gameserver.db.deleteAvatarByUserID(player2.player.user_id, 1061);
  }
  if (new_rel_status === "m") {
    //Casados
    casar = true;
    self.gameserver.db.deleteAvatarByUserID(player2.player.user_id, 1062);
    if (Date.now() > self.player.gameserverevent) {
      //Logger.normal("Tipo de evento por casamiento #1");
      let Time_Event = Date.now() + 3600000;
      self.gameserver.db.updateTimeByEventServer(Time_Event, 60, "Casamiento", self.gameserver.id, 1);
      self.gameserver.pushBroadcast(new Message.chatResponse(self, "[" + self.player.game_id + " & " + player2.player.game_id + "] <3<3<3 Casados <3<3<3 Para celebrar su matrimonio a 200% GP & GOLD EVENT empezó por 1 hora en el Server " + self.gameserver.id + " - [Server " + self.gameserver.id + " Room " + self.room.id + "]", Types.CHAT_TYPE.LOVE));
      var event_serv = setTimeout(function () {
        self.gameserver.forEachAccount(function (account) {
          if (account !== null) {
            account.player.gameserverevent = Time_Event;
            account.gameserver.evento200 = true;
            /*var data_game_server = self.gameserver.chathistory.slice(0);
              
              data_game_server.push(['', '', 9]);
              if (self.gameserver.evento200 === true) {
                var w = self.gameserver.SecondsToString(parseInt(self.player.gameserverevent));
                data_game_server.push(['¡EVENTO! GP & Gold: 200% - '+w+' para finalizar.', '', 17]);
              }
              account.send([Types.SERVER_OPCODE.room_state, [0, data_game_server], 1]);*/
          }
        });
      }, 4000);
    } else {
      //Logger.normal("Tipo de evento por casamiento #2");
      let Time_Event = parseInt(self.player.gameserverevent) + 3600000;
      self.gameserver.db.updateTimeByEventServer(Time_Event, 60, "Casamiento", self.gameserver.id, 1);
      var w = self.gameserver.SecondsToString(Time_Event);
      self.gameserver.pushBroadcast(new Message.chatResponse(self, "[" + self.player.game_id + " & " + player2.player.game_id + "] <3<3<3 Casados <3<3<3 Para celebrar su matrimonio a 200% GP & GOLD EVENT empezó por " + w + " en el Server " + self.gameserver.id + " - [Server " + self.gameserver.id + " Room " + self.room.id + "]", Types.CHAT_TYPE.LOVE));
      var event_serv = setTimeout(function () {
        self.gameserver.forEachAccount(function (account) {
          if (account !== null) {
            account.player.gameserverevent = Time_Event;
            account.gameserver.evento200 = true;
            /*var data_game_server = self.gameserver.chathistory.slice(0);
              
              data_game_server.push(['', '', 9]);
              if (self.gameserver.evento200 === true) {
                var w = self.gameserver.SecondsToString(parseInt(self.player.gameserverevent));
                data_game_server.push(['¡EVENTO! GP & Gold: 200% - '+w+' para finalizar.', '', 17]);
              }
              account.send([Types.SERVER_OPCODE.room_state, [0, data_game_server], 1]);*/
          }
        });
      }, 4000);
    }
  }
  if (casar) {
    self.gameserver.db.updateRelationStatusByIdAcc(new_rel_status, from_id, self.player.user_id);
    self.gameserver.db.updateRelationStatusByIdAcc(new_rel_status, self.player.user_id, from_id);
    //----------------------------------------------------------//
    self.player.relationship_status = new_rel_status;
    self.player.relationship_with_id = player2.player.user_id;
    self.player.relationship_with_rank = player2.player.rank;
    self.player.relationship_with_photo = player2.player.photo_url;
    self.player.relationship_with_name = player2.player.game_id;
    self.player.relationship_with_gender = player2.player.gender;
    //----------------------------------------------------------//
    player2.player.relationship_status = new_rel_status;
    player2.player.relationship_with_id = self.player.user_id;
    player2.player.relationship_with_rank = self.player.rank;
    player2.player.relationship_with_photo = self.player.photo_url;
    player2.player.relationship_with_name = self.player.game_id;
    player2.player.relationship_with_gender = self.player.gender;
    //----------------------------------------------------------//
    self.sendMessage(new Message.loginResponse(self));
    self.gameserver.sendAccountsOnline();
    player2.sendMessage(new Message.loginResponse(player2));
    player2.gameserver.sendAccountsOnline();
    //==========================================================//
    self.room.RoomUpdate(self);
    self.room.RoomUpdate(player2);
  }
}
