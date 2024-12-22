const Message = require("../../lib/message");

var Types = require("../../gametypes");
var Player = require("../../player");

module.exports = function handleGameItems(message) {
  const self = this;

  // seguridad
  if (!self.login_complete) {
    console.log("login incomplete", opcode);
    self.connection.close();
    return null;
  }
  //Logger.info("Items Seleccionados: " + message);
  //Arreglar Problema De Items
  var GameItems = message[1];
  self.player.item1 = GameItems[0];
  self.player.item2 = GameItems[2];
  self.player.item3 = GameItems[4];
  let item_data = [Types.SERVER_OPCODE.items, [[self.player.item1, -1, self.player.item2, -1, self.player.item3, -1], -1]];
  self.send(item_data);
}
