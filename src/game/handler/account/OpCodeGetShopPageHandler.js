const Message = require("../../lib/message");

var Types = require("../../gametypes");
var Player = require("../../player");

module.exports = function handleGetShopPage(message) {
  const self = this;

  let AVATAR_TYPE_TO_NUMBER = {
    h: 0,
    b: 1,
    g: 2,
    f: 3,
    1: 4,
    2: 5,
    x: 6
  };
  let type = AVATAR_TYPE_TO_NUMBER[message[1]];
  let page = message[2];
  if (type === null) {
    type = 0;
  }
  if (page === null) {
    page = 0;
  }
  var data_page = self.gameserver.avatars.getShopListType(type, page);
  if (message[1].length > 1) {
    data_page = self.gameserver.avatars.getShopListType(type, page, true, message[1], self.player.gm);
  }
  if (data_page !== null) {
    self.send(data_page);
    //self.send([Types.SERVER_OPCODE.next_avatar, 66723, 7454949, 2, 'a', 'Scream']);//Ventana New Avatar
  }
}
