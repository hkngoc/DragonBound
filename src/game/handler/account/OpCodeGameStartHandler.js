const Message = require("../../lib/message");

var Types = require("../../gametypes");
var Player = require("../../player");
var Room = require("../../room");

const {
  // secondsRemaining,
  pin_code_generador,
  getRndInteger,

  ArrayToObject,
} = require("../../utils");

module.exports = function handleGameStart(message) {
  const self = this;

  // seguridad
  if (!self.login_complete) {
    console.log("login incomplete", opcode);
    self.connection.close();
    return null;
  }
  /*if ((self.player.rank >= 27) === false) {
      return null;
    }*/

  if (self.room) {
    if (self.room.game_mode === Types.GAME_MODE.BOSS) {
      if (self.room.team_bots_count === 0) {
        self.sendMessage(new Message.alertResponse("Hola " + this.player.game_id, "Para Empezar La Partida Amenos Debe De Eligir Mínimo Un Boss."));
        return null;
      }
    }
    if (self.player.is_master === 1) {
      var TeamRandom = 0;
      if (self.room.game_mode !== Types.GAME_MODE.BOSS) {
        TeamRandom = getRndInteger(0, 1);
      }
      self.room.frist_turn = TeamRandom;
      //Guilds Prix
      var info_prix = ArrayToObject(self.player.tournament, "start_time end_time players avatar_on max_wind force_mobile name total_games last_5_minutes_games rooms maps game_mode s1 tp save_personal save_guild min_points different_mobiles gifts gp_event turn_time".split(" "));
      if (self.room.search_team_room === 1) {
        //Inicio de codigo del Vs Team
        if (self.room.player_count < 4 && self.gameserver.name === "Guilds Prix") {
          self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.NOT_4_SAME_GUILD, []));
          return null;
        }
        if (self.room.player_count === 1 && self.gameserver.name !== "Prix") {
          self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.FEW_PLAYERS, []));
          return null;
        } else if (self.player.tournament_start_time_server >= Date.now() && self.gameserver.name === "Guilds Prix") {
          self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.TOURNAMENT_NOT_STARTED, []));
          return null;
        } else if (self.player.tournament_end_time_server <= Date.now() && self.gameserver.name === "Guilds Prix") {
          self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.TOURNAMENT_ENDED, []));
          return null;
        } else if (self.player.guild === "" && self.gameserver.name === "Guilds Prix") {
          self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.NO_GUILD, []));
          return null;
        } else if (self.player.guild_score <= info_prix.min_points && self.gameserver.name === "Guilds Prix") {
          self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.DISQUALIFIED_GUILD, [self.player.guild_score, info_prix.min_points]));
          return null;
        } else {
          self.room.team_tournament_game = 1;
          self.room.forPlayers(function (account1) {
            if (self.gameserver.name === "Guilds Prix") {
              if (self.player.guild !== "") {
                if (account1.player.guild === self.player.guild) {
                  account1.send([Types.SERVER_OPCODE.team_search, 1]);
                } else if (account1.player.guild !== self.player.guild) {
                  self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.NOT_IN_MY_GUILD, []));
                  account1.send([Types.SERVER_OPCODE.team_search, 0]);
                  self.send([Types.SERVER_OPCODE.team_search, 0]);
                  self.room.team_tournament_game = 0;
                  return null;
                } else {}
              }
            } else {
              account1.send([Types.SERVER_OPCODE.team_search, 1]);
            }
            //account1.send([Types.SERVER_OPCODE.team_search, 1]);
          });
          if (self.gameserver.name === "Guilds Prix") {
            self.room.room_players_guild = self.player.guild; //pin_code_generador(9)
          } else {
            self.room.room_players_guild = pin_code_generador(9);
          }
          self.gameserver.forEachRooms(function (rooms_search) {
            if (self.room.team_tournament_game === 1) {
              if (self.room.id != rooms_search.id) {
                if (self.room.team_tournament_game === 1 && rooms_search.team_tournament_game === 1) {
                  if (self.room.player_count === rooms_search.player_count) {
                    if (self.room.room_players_guild !== rooms_search.room_players_guild) {
                      //
                      self.room.team_tournament_game = 0;
                      rooms_search.team_tournament_game = 0;
                      self.room.forPlayers(function (account1) {
                        account1.player.team_tournament_room = self.room.id;
                        if (account1.player.is_master === 1) {
                          account1.player.user_master_room = 1;
                        }
                      });
                      rooms_search.forPlayers(function (account2) {
                        account2.player.team_tournament_room = rooms_search.id;
                        if (account2.player.is_master === 1) {
                          account2.player.user_master_room = 1;
                        }
                      });
                      self.room.room_tournament_playing = 1;
                      rooms_search.room_tournament_playing = 1;
                      let id = self.gameserver.getIdforRoom();
                      self.gameserver.rooms[id] = new Room(id, "Team Start", "", 8, 0, self.gameserver);
                      self.gameserver.getRoomById(id, function (room) {
                        if (room) {
                          room.team_tournament_game = 0;
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
                          room.is_avatars_on = info_prix.avatar_on;
                          room.turn_time = info_prix.turn_time;
                          room.is_s1_disabled = 0;
                          room.is_tele_disabled = 1;
                          self.room.forPlayers(function (account1) {
                            account1.send([Types.SERVER_OPCODE.team_search, 0]);
                            account1.location_type = Types.LOCATION.ROOM;
                            account1.player.room_number = room.id;
                            if (self.gameserver.name === "Guilds Prix") {
                              account1.player.mobile = info_prix.force_mobile;
                            }
                            account1.player.is_master = 0;
                            account1.player.is_ready = 1;
                            room.team_a[account1.user_id] = account1.user_id;
                            account1.player.team = 0;
                            room.team_a_count++;
                            room.player_count++;
                            if (room.team_a_count + room.team_b_count != room.player_count) {
                              room.player_count = room.team_a_count + room.team_b_count;
                            }
                            account1.send([Types.SERVER_OPCODE.enter_room]);
                            room.updatePosition().then(function () {
                              account1.room = room;
                              account1.sendMessage(new Message.roomState(room));
                              self.gameserver.pushToRoom(room.id, new Message.roomPlayers(room), null);
                            });
                          });
                          rooms_search.forPlayers(function (account2) {
                            account2.send([Types.SERVER_OPCODE.team_search, 0]);
                            account2.player.room_number = room.id;
                            account2.location_type = Types.LOCATION.ROOM;
                            if (self.gameserver.name === "Guilds Prix") {
                              account2.player.mobile = info_prix.force_mobile;
                            }
                            account2.player.is_master = 0;
                            account2.player.is_ready = 1;
                            room.team_b[account2.user_id] = account2.user_id;
                            account2.player.team = 1;
                            room.team_b_count++;
                            account2.send([Types.SERVER_OPCODE.enter_room]);
                            room.updatePosition().then(function () {
                              account2.room = room;
                              account2.sendMessage(new Message.roomState(room));
                              self.gameserver.pushToRoom(room.id, new Message.roomPlayers(room), null);
                            });
                          });
                          room.frist_turn = 0;
                          room.gameStart(self);
                        }
                      });
                      return null;
                    } //
                  } //
                }
              }
            }
          });
        } //Fin Del Codigo Vs Team
      } else {
        var start_game = true;
        self.room.forPlayers(function (account) {
          if (self.player.gm != 1 && self.player.computer_ip === account.player.computer_ip && self.player.team !== self.gameserver.getAccountById(account.player.user_id).player.team) {
            start_game = false;
          }
        });
        //TODO: revert this
        self.room.gameStart(self);
        // if (start_game) {
        // 	self.room.gameStart(self);
        // } else {
        // 	self.send([0,"It is forbidden to play with alternate accounts!!","",6]);
        // }
      }
    }
  }
}
