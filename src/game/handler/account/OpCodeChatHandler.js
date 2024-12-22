// const Message = require("../../lib/message");

var Types = require("../../gametypes");
// var Player = require("../../player");

module.exports = function handleChat(message) {
  const self = this;

  // seguridad
  if (!self.login_complete) {
    console.log("login incomplete", opcode);
    self.connection.close();
    return null;
  }

  let _msj = message[1];
  let _team = parseInt(message[2]);
  let _unk = parseInt(message[3]);
  let ch = self.location_type == Types.LOCATION.CHANNEL ? true : false;

  //if (self.player.gm === 1) {/*Solucionar Este Problema*/
  self.commands.parse(/*_msj*/message);

  //}

  var showm = true;

  if (_msj[0] == /*=*/"/" /* && self.player.gm === 1*/) {
    showm = false;
  }

  if (self.gameserver.chathistory.length > 100) {
    self.gameserver.chathistory = [];
  }

  /* if (showm) {
    if (self.location_type === Types.LOCATION.CHANNEL) {
      console.log("chat enviendo al channel");
    } else if (self.location_type === Types.LOCATION.ROOM) {
      //Logger.log('Chat DBB: '+message);
      console.log("chat enviendo a la sala");
    }
  } */

}
