const Message = require("../../lib/message");

var Types = require("../../gametypes");
var Player = require("../../player");

module.exports = function handleGameUseItem(message) {
  const self = this;

  // seguridad
  if (!self.login_complete) {
    console.log("login incomplete", opcode);
    self.connection.close();
    return null;
  }
  var item_used_name = "";
  var item_used = [Types.SERVER_OPCODE.items, [[0, -1, 2, -1, 1, -1], -1]];

  //Logger.info('Items: '+message[1]);
  //Types.ITEM.DUAL_PLUS;
  if (self.room) {
    let x__;
    if (message[1] === 0) {
      x__ = self.player.item1;
    } else if (message[1] === 2) {
      x__ = self.player.item2;
    } else {
      x__ = self.player.item3;
    }
    if (message[1] === 0) {
      if (self.player.item1 === 0) {
        self.player.item1 = -1;
        self.player.DUAL = 1;
        self.player.itemUsed = Types.ITEM.DUAL;
        item_used_name = "Dual";
      } else if (self.player.item1 === 1) {
        self.player.item1 = -1;
        self.player.TELEPORT = 1;
        self.player.itemUsed = Types.ITEM.TELEPORT;
        item_used_name = "Teleport";
      } else if (self.player.item1 === 2) {
        self.player.item1 = -1;
        self.player.DUAL_PLUS = 1;
        self.player.itemUsed = Types.ITEM.DUAL_PLUS;
        item_used_name = "Dual+";
      } else {}
      item_used = [Types.SERVER_OPCODE.items, [[self.player.item1, -1, self.player.item2, -1, self.player.item3, -1], -1]];
    }
    if (message[1] === 2) {
      if (self.player.item2 === 0) {
        self.player.item2 = -1;
        self.player.DUAL = 1;
        self.player.itemUsed = Types.ITEM.DUAL;
        item_used_name = "Dual";
      } else if (self.player.item2 === 1) {
        self.player.item2 = -1;
        self.player.TELEPORT = 1;
        self.player.itemUsed = Types.ITEM.TELEPORT;
        item_used_name = "Teleport";
      } else if (self.player.item2 === 2) {
        self.player.item2 = -1;
        self.player.DUAL_PLUS = 1;
        self.player.itemUsed = Types.ITEM.DUAL_PLUS;
        item_used_name = "Dual+";
      } else {}
      item_used = [Types.SERVER_OPCODE.items, [[self.player.item1, -1, self.player.item2, -1, self.player.item3, -1], -1]];
    }
    if (message[1] === 4) {
      if (self.player.item3 === 0) {
        self.player.item3 = -1;
        self.player.DUAL = 1;
        self.player.itemUsed = Types.ITEM.DUAL;
        item_used_name = "Dual";
      } else if (self.player.item3 === 1) {
        self.player.item3 = -1;
        self.player.TELEPORT = 1;
        self.player.itemUsed = Types.ITEM.TELEPORT;
        item_used_name = "Teleport";
      } else if (self.player.item3 === 2) {
        self.player.item3 = -1;
        self.player.DUAL_PLUS = 1;
        self.player.itemUsed = Types.ITEM.DUAL_PLUS;
        item_used_name = "Dual+";
      } else {}
      item_used = [Types.SERVER_OPCODE.items, [[self.player.item1, -1, self.player.item2, -1, self.player.item3, -1], -1]];
    }
    self.gameserver.pushToRoom(self.player.room_number, new Message.usedItems(self, x__));
    self.send(item_used);
  }
}
