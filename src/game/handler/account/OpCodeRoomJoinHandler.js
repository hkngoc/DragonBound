const Message = require("../../lib/message");

var Types = require("../../gametypes");
var Player = require("../../player");

const {
  secondsRemaining,
  // pin_code_generador,
  // getRndInteger,

  ArrayToObject,
} = require("../../utils");

module.exports = function handleRoomJoin(message) {
  const self = this;

  // seguridad
  if (!self.login_complete) {
    console.log("login incomplete", opcode);
    self.connection.close();
    return null;
  }
  let id = message[1];
  let password = message[2];
  if (self.room != undefined) {
    return false;
  }
  var info_prix = ArrayToObject(self.player.tournament, "start_time end_time players avatar_on max_wind force_mobile name total_games last_5_minutes_games rooms maps game_mode s1 tp save_personal save_guild min_points different_mobiles gifts gp_event turn_time".split(" "));
  self.gameserver.getRoomById(id, function (room) {
    if (room) {
      if (room.search_team_room === 1 && room.player_count >= 4) {
        self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.ROOM_FULL, []));
        return null;
      } else if (room.search_team_room === 1 && room.room_tournament_playing === 1) {
        self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.ROOM_PLAYING, []));
        return null;
      } else if (typeof room.kick_user_time[parseInt(self.player.user_id)] !== "undefined") {
        if (parseInt(room.kick_user_time[self.player.user_id].expiry) >= Date.now()) {
          self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.KICKED, [parseInt(secondsRemaining(room.kick_user_time[parseInt(self.player.user_id)].expiry))]));
          var delete_kick = setTimeout(function () {
            delete room.kick_user_time[parseInt(self.player.user_id)];
            delete_kick = null;
          }, parseInt(Math.round(secondsRemaining(room.kick_user_time[parseInt(self.player.user_id)].expiry) * 1000)));
          return null;
        }
      } else if (room.player_count < room.max_players && room.status === Types.ROOM_STATUS.WAITING && !room.findPlayer(self.user_id)) {
        if (room.look === 1 && self.player.rank !== 26 && self.player.rank !== 27 && self.player.rank !== 31) {
          if (room.password !== password) {
            self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.WRONG_PASSWORD, []));
          } else {
            if (room.game_mode === Types.GAME_MODE.SAME) {
              var mobile_same = 0;
              room.forPlayers(function (accountjc) {
                if (accountjc !== null) {
                  if (accountjc.player.is_master === 1) {
                    mobile_same = accountjc.player.mobile;
                  }
                }
              });
              self.player.mobile = mobile_same;
            }
            room.joinPlayer(self);
            self.location_type = Types.LOCATION.ROOM;
            self.player.room_number = room.id;
          }
        } else {
          if (room.game_mode === Types.GAME_MODE.SAME) {
            var mobile_same = 0;
            room.forPlayers(function (accountjc) {
              if (accountjc !== null) {
                if (accountjc.player.is_master === 1) {
                  mobile_same = accountjc.player.mobile;
                }
              }
            });
            self.player.mobile = mobile_same;
          }
          room.joinPlayer(self);
          self.location_type = Types.LOCATION.ROOM;
          self.player.room_number = room.id;
          if (self.gameserver.name === "Guilds Prix") {
            if (info_prix.force_mobile !== -1 || info_prix.force_mobile !== -2) {
              self.player.mobile = info_prix.force_mobile;
            }
          }
        }
      } else if (room.status === Types.ROOM_STATUS.PLAYING) {
        self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.ROOM_PLAYING, []));
      } else {
        self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.ROOM_FULL, []));
        /*self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.CANT_JOIN_NEED_AVATAR, ['Rusia 2018']));*/
        if (self.player.rank === 26 || self.player.rank === 27 || self.player.rank === 31) {
          if (room.game_mode === Types.GAME_MODE.SAME) {
            var mobile_same = 0;
            room.forPlayers(function (accountjc) {
              if (accountjc !== null) {
                if (accountjc.player.is_master === 1) {
                  mobile_same = accountjc.player.mobile;
                }
              }
            });
            self.player.mobile = mobile_same;
          }
          room.joinPlayer(self);
          self.location_type = Types.LOCATION.ROOM;
          self.player.room_number = room.id;
        }
      }
    } else {
      self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.ROOM_DOES_NOT_EXIST, []));
    }
  });
}
