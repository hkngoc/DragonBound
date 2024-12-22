const Message = require("../../lib/message");

var Types = require("../../gametypes");
var Player = require("../../player");
var Room = require("../../room");

module.exports = function handleRoomCreate(message) {
  const self = this;

  // seguridad
  if (!self.login_complete) {
    console.log("login incomplete", opcode);
    self.connection.close();
    return null;
  }

  const ip = this.connection._connection._socket.remoteAddress;

  self.ip_actions[ip].actions.push(Date.now());
  if (self.room) {
    return null;
  }
  /*if ((self.player.rank >= 27) === false) {
                  return null;
              }*/

  let id = self.gameserver.getIdforRoom();
  //self.player.room_number = id;/* MIRAR */
  let title = message[1];
  let password = message[2];
  let maxplayers = message[3];
  let gamemode = message[4];
  self.gameserver.rooms[id] = new Room(id, title, password, maxplayers, gamemode, self.gameserver);
  self.gameserver.getRoomById(id, function (room) {
    if (room) {
      if (room.player_count < room.max_players) {
        self.player.is_master = 1;
        room.joinPlayer(self);
        self.player.room_number = room.id;
        self.location_type = Types.LOCATION.ROOM;
        if (self.gameserver.server_subtype !== 3) {
          self.gameserver.sendRooms();
        }
        if (self.player.power_user === 1) {
          room.power = 1;
        }
      }
    } else {
      self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.ROOM_DOES_NOT_EXIST, []));
    }
  });
}
