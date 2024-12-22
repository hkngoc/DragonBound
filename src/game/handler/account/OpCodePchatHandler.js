const Message = require("../../lib/message");

var Types = require("../../gametypes");
var Player = require("../../player");

module.exports = function handlePchat(message) {
  const self = this;

  // seguridad
  if (!self.login_complete) {
    console.log("login incomplete", opcode);
    self.connection.close();
    return null;
  }
  let _id = parseInt(message[1]);
  if (typeof _id !== "number") {
    return null;
  }
  let _msj = message[2];
  if (_id == 0) {
    if (self.player.guild_id > 0) {
      console.log("mensaje para el guild");
      self.gameserver.guildMessage(self, _msj);
    }
  } else {
    let account = self.gameserver.searchAccountById(_id);
    if (typeof account !== "undefined" && account !== null) {
      account.sendMessage(new Message.pChatResponse(self, this.player.game_id, _msj));
      self.sendMessage(new Message.pChatResponse(account, this.player.game_id, _msj));
      Logger.info("Chat Privado [De: " + self.player.game_id + "] - [Para: " + account.player.game_id + "] SMS: " + _msj);
    } else {
      var accountback = self.gameserver.last_account_info[_id];
      if (accountback != undefined) {
        self.sendMessage(new Message.pChatResponse(accountback, this.player.game_id, _msj));
        self.sendMessage(new Message.pChatResponse(accountback, "Offline", " PM será entregado cuando el usuario inicie sesión."));
        if (self.gameserver.pending_messages[_id] == undefined) {
          self.gameserver.pending_messages[_id] = [];
        }
        self.gameserver.pending_messages[_id].push(new Message.pChatResponse(self, this.player.game_id, _msj).serialize());
      }
      return null;
    }
  }
}
