const Message = require("../../lib/message");

var Types = require("../../gametypes");
var Player = require("../../player");

module.exports = function handleQuickJoin(message) {
  const self = this;

  // seguridad
  if (!self.login_complete) {
    console.log("login incomplete", opcode);
    self.connection.close();
    return null;
  }
  var data_room = [];
  //Logger.normal("Room Number: "+self.player.room_number);
  if (self.player.room_number === 0) {
    //Logger.normal("Entro al codigo de Quick Join");
    self.gameserver.forEachRooms(function (roomss) {
      //Logger.normal("Date Room: "+JSON.stringify(roomss));
      if (roomss.status === Types.ROOM_STATUS.WAITING) {
        if (roomss.player_count < roomss.max_players && roomss.status === Types.ROOM_STATUS.WAITING) {
          data_room.push([roomss.id]);
        }
      }
    });
    var room_random = data_room[Math.floor(Math.random() * data_room.length)];
    //Logger.info("Mi Sala Random es: "+room_random);
    self.gameserver.getRoomById(parseInt(room_random), function (room) {
      if (room) {
        if (room.player_count < room.max_players && room.status === Types.ROOM_STATUS.WAITING && !room.team_a[self.user_id] && !room.team_b[self.user_id]) {
          if (room.password === "") {
            room.joinPlayer(self);
            self.location_type = Types.LOCATION.ROOM;
            self.player.room_number = room.id;
            return null;
          }
        }
      }
    });
  }
}
