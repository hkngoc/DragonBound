const Message = require("../../lib/message");

var Types = require("../../gametypes");
var Player = require("../../player");

module.exports = function handleRoomOptions(message) {
  const self = this;

  // seguridad
  if (!self.login_complete) {
    console.log("login incomplete", opcode);
    self.connection.close();
    return null;
  }
  let chang_rom = false;
  if (self.room) {
    if (self.room.search_team_room === 1) {
      return null;
    }
    if (self.player.is_master = 1) {
      self.room.max_players = message[1];
      chang_rom = true;
      if (self.room.player_count < self.room.max_players) {
        self.room.status = Types.ROOM_STATUS.WAITING;
        chang_rom = true;
        if (self.gameserver.server_subtype !== 3) {
          self.gameserver.sendRooms();
        }
      }
      if (self.room.player_count >= self.room.max_players) {
        self.room.status = Types.ROOM_STATUS.FULL;
        chang_rom = true;
        if (self.gameserver.server_subtype !== 3) {
          self.gameserver.sendRooms();
        }
      }
      self.room.game_mode = message[2];
      chang_rom = true;
      self.room.map = message[3];
      self.room.is_avatars_on = message[4];
      self.room.max_wind = message[5];
      self.room.is_s1_disabled = message[7]; /*6*/
      self.room.is_tele_disabled = message[8]; /*7*/
      self.room.is_random_teams = message[9]; /*8*/
      self.room.is_dual_plus_disabled = message[10]; /*9*/
      self.room.turn_time = message[11];
      self.room.room_for_sale = message[12];
      self.room.allow_watch = message[13];
      self.room.allow_talk = message[14];
      if (self.gameserver.server_subtype !== 3) {
        self.gameserver.sendRooms();
      }
      //Logger.debug("room_options: " + message);
      //Logger.debug("Avatars: " + message[4]);
      if (self.room.game_mode === Types.GAME_MODE.BOSS) {
        if (self.room.player_count <= 4) {
          self.room.forPlayers(function (account) {
            if (account.player.team === 1 && account.player.is_bot === 0) {
              account.room.ChangeTeamBoss(account);
            }
          });
        } else {
          self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.CANT_BOSS_PLAYERS, []));
        }
      }
      self.room.RoomUpdate(self);
    }
  }
}
