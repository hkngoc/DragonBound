const Message = require("../../lib/message");

var Types = require("../../gametypes");
var Player = require("../../player");
var Room = require("../../room");

const {
  // secondsRemaining,
  // pin_code_generador,
  // getRndInteger,

  ArrayToObject,
} = require("../../utils");

module.exports = function handleCreateTeam(message) {
  const self = this;

  // seguridad
  if (!self.login_complete) {
    console.log("login incomplete", opcode);
    self.connection.close();
    return null;
  }
  //Logger.normal("Tournament: "+JSON.stringify(self.player.tournament));
  var info_prix = ArrayToObject(self.player.tournament, "start_time end_time players avatar_on max_wind force_mobile name total_games last_5_minutes_games rooms maps game_mode s1 tp save_personal save_guild min_points different_mobiles gifts gp_event turn_time".split(" "));
  if (info_prix.players === 2) {
    self.sendMessage(new Message.alertResponse("No teams on this server", "Only 1v1 games are allowed on this server right now."));
    return null;
  }
  let id = self.gameserver.getIdforRoom();
  self.player.room_number = id; /* MIRAR */
  self.gameserver.rooms[id] = new Room(id, "Team", "", 8, 0, self.gameserver);
  self.gameserver.getRoomById(id, function (room) {
    if (room) {
      if (room.player_count < room.max_players) {
        self.player.is_master = 1;
        if (self.gameserver.name === "Guilds Prix") {
          if (info_prix.force_mobile !== -1 || info_prix.force_mobile !== -2) {
            self.player.mobile = info_prix.force_mobile;
          }
        }
        room.search_team_room = 1;
        room.room_tournament_playing = 0;
        room.is_avatars_on = parseInt(info_prix.avatar_on);
        room.turn_time = parseInt(info_prix.turn_time);
        room.max_wind = parseInt(info_prix.max_wind);
        room.is_s1_disabled = parseInt(1);
        room.is_tele_disabled = parseInt(1);
        room.is_dual_plus_disabled = parseInt(0);
        if (self.gameserver.name === "Bunge.") {
          var data_maps_server = info_prix.maps;
          var room_random = data_maps_server[Math.floor(Math.random() * data_maps_server.length)];
          if (room_random === 40) {
            room_random = 39;
          }
          room.map = Types.MAPS_PLAY[room_random];
        } else if (self.gameserver.name === "Battle Off") {
          var data_maps_server = info_prix.maps;
          var room_random = data_maps_server[Math.floor(Math.random() * data_maps_server.length)];
          room.map = Types.MAPS_PLAY[room_random];
        } else {
          var data_maps_server = info_prix.maps;
          var room_random = data_maps_server[Math.floor(Math.random() * data_maps_server.length)];
          if (room_random === 40) {
            room_random = 39;
          }
          room.map = Types.MAPS_PLAY[room_random];
        }
        room.joinPlayer(self);
        self.location_type = Types.LOCATION.ROOM;
        room.RoomUpdate(self);
        self.player.room_number = room.id;
        self.sendMessage(new Message.loginResponse(self));
      }
    } else {
      self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.ROOM_DOES_NOT_EXIST, []));
    }
  });
}
