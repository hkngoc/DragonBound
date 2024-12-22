const Message = require("../../lib/message");

var Types = require("../../gametypes");
var Player = require("../../player");
var Room = require("../../room");
var Bot = require("../../bot");

const {
  // secondsRemaining,
  // pin_code_generador,
  getRndInteger,

  ArrayToObject,
} = require("../../utils");

module.exports = function handleTournamentStartGame(message) {
  const self = this;

  // seguridad
  if (!self.login_complete) {
    console.log("login incomplete", opcode);
    self.connection.close();
    return null;
  }
  var info_prix = ArrayToObject(self.player.tournament, "start_time end_time players avatar_on max_wind force_mobile name total_games last_5_minutes_games rooms maps game_mode s1 tp save_personal save_guild min_points different_mobiles gifts gp_event turn_time".split(" "));
  var unk1 = message[1];
  var mobile_prix = info_prix.force_mobile; //info_prix.force_mobile
  if (info_prix.force_mobile === -1 || info_prix.force_mobile === -2) {
    mobile_prix = message[2];
  }
  //Logger.info('Mobile Prix: '+mobile_prix);
  let id_bot = parseInt(getRndInteger(80000, 80500));
  if (typeof Types.MOBILES[mobile_prix] != "undefined" && Types.MOBILES[mobile_prix] !== null) {
    /*if (mobile_prix == Types.MOBILE.DRAGON && self.player.rank !== 31 && self.player.rank !== 26) {
        self.sendMessage(new Message.alertResponse("Non-Selectable Mobile", "You can not select this mobile."));
        return null;
      }*/
    if (mobile_prix == Types.MOBILE.RANDOM) {
      var random_number = parseInt(getRndInteger(0, 6));
      if (random_number === 7) {
        random_number = 26;
      }
      mobile_prix = random_number;
    }
    self.player.mobile = mobile_prix;
  }
  if (self.gameserver.name === "Guilds Prix") {
    self.sendMessage(new Message.alertResponse("I am sorry", "4v4 Guild vs Guild Games"));
    return null;
  }
  if (self.gameserver.name === "Prix") {
    if (self.player.tournament_start_time_server >= Date.now()) {
      self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.TOURNAMENT_NOT_STARTED, []));
      return null;
    }
    if (self.player.tournament_start_time_server <= Date.now() && self.player.tournament_end_time_server <= Date.now()) {
      self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.TOURNAMENT_ENDED, []));
      return null;
    }
    if (self.player.punts_prix_user <= info_prix.min_points) {
      self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.DISQUALIFIED_PLAYER, [self.player.punts_prix_user, info_prix.min_points]));
      return null;
    }
  }

  /*if (self.gameserver.id === 3) {
      if (self.player.cash <= 1499) {
        self.sendMessage(new Message.alertResponse("I am sorry", "You do not have enough cash to start this game. <img class='emo' src='/static/images/emo/sad.png'>"));
        return null;
      }
    }*/

  self.player.tournament_wait_game = 1;
  self.send([Types.SERVER_OPCODE.tournament_wait, parseInt(getRndInteger(1, 3))]); //self.send([41,parseInt(getRndInteger(1, 3))]);
  //let id = self.gameserver.getIdforRoom();
  //Logger.info("Get ID For Room: "+id);
  if (self.player.tournament_wait_game == 1) {
    /* || *===============[Start of the BOT Computer code]================* || */
    setTimeout(function () {
      if (self.location_type === Types.LOCATION.CHANNEL && self.player.tournament_wait_game == 1 && self.gameserver.id === 2 || self.location_type === Types.LOCATION.CHANNEL && self.player.tournament_wait_game == 1 && self.gameserver.name === "Bunge.") {
        let id = self.gameserver.getIdforRoom();
        self.gameserver.rooms[id] = new Room(id, "(time) BOT Computer (time)", "", 1, 1, self.gameserver);
        //var cant = Types.COMPUTER_PLAYER.length;
        var __comp = parseInt(getRndInteger(0, 11));
        self.gameserver.getRoomById(id, function (room) {
          if (room) {
            let id = self.gameserver.getIdforBot();
            var bot_data = {
              user_id: id,
              reg_id: 0,
              game_id: Types.COMPUTER_PLAYER[__comp].game_id,
              rank: Types.COMPUTER_PLAYER[__comp].rank,
              gp: Types.COMPUTER_PLAYER[__comp].gp,
              gold: 0,
              cash: 0,
              gender: Types.COMPUTER_PLAYER[__comp].gender,
              photo_url: "",
              ahead: Types.COMPUTER_PLAYER[__comp].ahead,
              abody: Types.COMPUTER_PLAYER[__comp].abody,
              aeyes: Types.COMPUTER_PLAYER[__comp].aeyes,
              aflag: Types.COMPUTER_PLAYER[__comp].aflag,
              abackground: 0,
              aforeground: 0,
              is_muted: 0,
              guild: Types.COMPUTER_PLAYER[__comp].guild,
              guild_id: 0,
              guild_job: 0
            };
            var plx = new Player(bot_data);
            plx.is_bot = 1;
            plx.is_ready = 1;
            plx.position = 1;
            plx.mobile = Types.COMPUTER_PLAYER[__comp].mobile;
            plx.scores_lose = 1;
            let acc = new Bot(plx);
            acc.user_id = id;
            acc.gameserver = self.gameserver;
            self.gameserver.bots[acc.user_id] = acc;
            room.addBot(acc);
            /* || *===============[Bot Computer]================* || */
            self.player.is_master = 1;
            room.joinPlayer(self);
            if (room.player_count <= 2) {
              self.location_type = Types.LOCATION.ROOM;
            } else {
              return null;
            }
            self.player.room_number = room.id;
            self.player.tournament_wait_game = 0;
            room.is_avatars_on = parseInt(info_prix.avatar_on);
            room.is_s1_disabled = 0;
            room.is_tele_disabled = 1;
            room.turn_time = info_prix.turn_time;
            room.max_wind = info_prix.max_wind;
            room.frist_turn = 0;
            room.gameStart(self);
          }
        });
        return null;
      }
    }, 5000);
    /* || *==============[End of the BOT Computer code]=================* || */
    /* || *===============[Start of the BOT Holiday code]================* || */
    var endpoints = 4;
    if (self.player.gm_probability >= endpoints) {
      endpoints = parseInt(self.player.gm_probability + 4);
    }
    let random_probability_holiday = parseInt(getRndInteger(3, endpoints));
    var Santa_Claus_Head = 7201;
    var Santa_Claus_Body = 2019;
    var cash = 10000;
    var Ava_Send = 0;
    //if (self.location_type === Types.LOCATION.CHANNEL && self.player.tournament_wait_game == 1 && self.gameserver.id === 7 || self.location_type === Types.LOCATION.CHANNEL && self.player.tournament_wait_game == 1 && self.gameserver.name === "Bunge.") {
    if (self.gameserver.name === "Holiday" && self.player.tournament_wait_game == 1 && self.player.gm_probability === random_probability_holiday /* || self.player.user_id === 1*/) {
      let id = self.gameserver.getIdforRoom();
      self.gameserver.rooms[id] = new Room(id, "(party) Halloween 2021 (party)", "", 1, 1, self.gameserver);
      self.gameserver.getRoomById(id, function (room) {
        if (room) {
          var bot_data = {
            user_id: id_bot,
            reg_id: id_bot,
            game_id: "Halloween",
            rank: 26,
            gp: 0,
            gold: 0,
            cash: 0,
            gender: "m",
            photo_url: "1234",
            ahead: 2713,
            abody: 2714,
            aeyes: 812,
            aflag: 2731,
            abackground: 0,
            aforeground: 0,
            is_muted: 0,
            guild: "",
            guild_id: 0,
            guild_job: 0
          };
          var plx = new Player(bot_data);
          plx.is_bot = 1;
          plx.is_ready = 1;
          plx.position = 1;
          plx.mobile = Types.MOBILE.ICE;
          plx.scores_lose = 1;
          let acc = new Bot(plx);
          acc.user_id = id_bot;
          acc.gameserver = self.gameserver;
          self.gameserver.bots[acc.user_id] = acc;
          room.addBot(acc);
          /* || *===============[Bot Computer]================* || */
          self.player.is_master = 1;
          room.joinPlayer(self);
          if (room.player_count <= 2) {
            self.location_type = Types.LOCATION.ROOM;
          } else {
            return null;
          }
          self.player.room_number = room.id;
          self.player.tournament_wait_game = 0;
          room.is_tele_disabled = 1;
          room.max_wind = info_prix.max_wind;
          room.frist_turn = 0;
          room.gameStart(self);
          room.game.onGameEnd(function (teamm) {
            room.forPlayers(function (accountdbb) {
              if (typeof accountdbb !== "undefined") {
                let playerdbb = accountdbb.player;
                if (teamm === playerdbb.team) {
                  playerdbb.is_win = 1;
                  accountdbb.saveWinDB(room.power == 1 ? true : false);
                  if (accountdbb.scores_lose !== 1) {
                    if (accountdbb.user_id >= 80000) {
                      return null;
                    }
                    if (playerdbb.gender === "m") {
                      Ava_Send = 7201;
                      Santa_Claus_Head = 7201;
                      Santa_Claus_Body = 2019;
                      cash = 10000;
                    } else {
                      Ava_Send = 7201;
                      Santa_Claus_Head = 7201;
                      Santa_Claus_Body = 2019;
                      cash = 10000;
                    }
                    self.gameserver.db.getUserAvatarsByIdAccANDaId(playerdbb.user_id, Ava_Send).then(function (rowss) {}).catch(function (err) {
                      var name_ava_gift_hd = self.gameserver.avatars.getAvatagift(Santa_Claus_Head);
                      var name_ava_gift_bd = self.gameserver.avatars.getAvatagift(Santa_Claus_Body);
                      let self2 = self.gameserver.getAccountById(parseInt(playerdbb.user_id));
                      accountdbb.player.gifts_holiday += 1;
                      let datasendgift_2 = {
                        UserId: playerdbb.user_id,
                        aId: Santa_Claus_Head,
                        type: 0,
                        expire_time: 0,
                        is_cash: 0,
                        is_gift: 1,
                        gift_sent_by: plx.user_id,
                        amount: 0,
                        date_ava_time: Date.now()
                      };
                      self.gameserver.db.putUserAvatars(datasendgift_2);
                      let datasendgift_3 = {
                        UserId: playerdbb.user_id,
                        aId: Santa_Claus_Body,
                        type: 0,
                        expire_time: 0,
                        is_cash: 0,
                        is_gift: 1,
                        gift_sent_by: plx.user_id,
                        amount: 0,
                        date_ava_time: Date.now()
                      };
                      self.gameserver.db.putUserAvatars(datasendgift_3);
                      self.gameserver.db.sendCash(cash, playerdbb.user_id);
                      self.gameserver.db.updateGiftsByHoliday(2, 1);
                      self2.player.cash += cash;
                      accountdbb.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.RECEIVED_AVATAR, [plx.game_id, Santa_Claus_Head, 0, "Halloween 2021", "forever", name_ava_gift_hd]));
                      accountdbb.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.RECEIVED_AVATAR, [plx.game_id, Santa_Claus_Body, 0, "Halloween 2021", "forever", name_ava_gift_bd]));
                      accountdbb.send([17, "Received Cash! :)", "You just received <font color='yellow'>" + cash + "</font> Cash from<br><font color='yellow'>" + accountdbb.game_id + "</font>.<br><br>Thank You!"]);
                      accountdbb.gameserver.pushBroadcast(new Message.chatResponse(self, plx.game_id + " sent gift -> " + name_ava_gift_hd + " [Flag] to -> " + playerdbb.game_id, Types.CHAT_TYPE.GOLD));
                      accountdbb.gameserver.pushBroadcast(new Message.chatResponse(self, plx.game_id + " sent gift -> " + name_ava_gift_bd + " [Background] to -> " + playerdbb.game_id, Types.CHAT_TYPE.GOLD));
                      self.gameserver.chathistory.push([plx.game_id + " sent gift -> " + name_ava_gift_hd + " [Flag] to -> " + playerdbb.game_id, "", Types.CHAT_TYPE.GOLD, ""]);
                      self.gameserver.chathistory.push([plx.game_id + " sent gift -> " + name_ava_gift_bd + " [Background] to -> " + playerdbb.game_id, "", Types.CHAT_TYPE.GOLD, ""]);
                    });
                    playerdbb.gm_probability += 1;
                    self.gameserver.db.updateProbability(playerdbb.gm_probability, playerdbb.user_id);
                  }
                } else {
                  playerdbb.is_loss = 1;
                  accountdbb.saveWinDB(room.power == 1 ? true : false);
                  if (accountdbb.scores_lose !== 1) {
                    playerdbb.gm_probability = 0;
                    self.gameserver.db.updateProbability(0, playerdbb.user_id);
                  }
                }
              }
            });
            room.game = null;
            room.status = Types.ROOM_STATUS.WAITING;
            room.gameserver.pushToRoom(room.id, new Message.roomPlayers(room));
            setTimeout(function () {
              self.player.room_number = 0;
              self.location_type = Types.LOCATION.CHANNEL;
              room.removePlayer(self);
              self.sendMessage(new Message.loginResponse(self));
              self.player.is_ready = 0;
              self.player.is_master = 0;
              self.gameserver.sendAccountsOnline();
              self.gameserver.removeRoom(room.id);
              self.gameserver.forEachAccount(function (accounttp) {
                if (accounttp !== null && accounttp.player.user_id === self.player.user_id) {
                  var data_game_server = self.gameserver.chathistory.slice(0);
                  data_game_server.push(["", "", 9]);
                  if (self.gameserver.evento200 === true) {
                    data_game_server.push([" El porcentaje de GP & Gold cambiaron a 200%", "[Inicio de Evento", 17]);
                  }
                  if (self.gameserver.id === 2) {
                    data_game_server.push([" Búscame, gáname y te llevas un regalo: (gift) " + accounttp.player.gifts_holiday + " Regalos enviados (gift)", "Halloween", 5]);
                    data_game_server.push([" Tienes " + accounttp.player.gm_probability + " ganadas seguidas = 200% GP & Gold! Event probabilidad x" + accounttp.player.gm_probability, "", 6]);
                  }
                  accounttp.send([Types.SERVER_OPCODE.room_state, [0, data_game_server], 1]);
                }
              });
            }, 1000);
          });
        }
      });
      return null;
    }
    /* || *==============[End of the BOT Computer code]=================* || */
    self.gameserver.forEachAccount(function (accountp) {
      //let id = self.gameserver.getIdforRoom();
      //Logger.info("Get ID For Room: "+id);
      if (accountp !== null ? accountp.user_id != self.user_id : false) {
        if (accountp.player.tournament_wait_game == 1 && self.player.tournament_wait_game == 1) {
          if (self.player.computer_ip !== accountp.player.computer_ip) {
            let id = self.gameserver.getIdforRoom();
            if (self.gameserver.name === "Prix") {
              self.gameserver.rooms[id] = new Room(id, "(party) Prix Individual (trophy)", "", 2, 0, self.gameserver);
            } else {
              self.gameserver.rooms[id] = new Room(id, "Individual", "", 2, 0, self.gameserver);
            }
            //Logger.info("Room Create: "+id);
            self.gameserver.getRoomById(id, function (room) {
              if (room) {
                if (room.player_count < room.max_players && room.status === Types.ROOM_STATUS.WAITING) {
                  if (self.player.room_number === 0 && accountp.player.room_number === 0) {
                    accountp.player.tournament_wait_game = 0;
                    self.player.tournament_wait_game = 0;
                    self.player.is_master = 1;
                    accountp.player.is_master = 0;
                    accountp.player.is_ready = 1;
                    room.joinPlayer(self);
                    room.joinPlayer(accountp);
                    if (room.player_count <= 2) {
                      self.location_type = Types.LOCATION.ROOM;
                      accountp.location_type = Types.LOCATION.ROOM;
                    } else {
                      return null;
                    }
                    self.player.room_number = id;
                    accountp.player.room_number = id;
                    room.status = Types.ROOM_STATUS.FULL;
                    room.is_avatars_on = parseInt(info_prix.avatar_on);
                    room.is_s1_disabled = 0;
                    room.is_tele_disabled = 1;
                    room.turn_time = info_prix.turn_time;
                    room.max_wind = info_prix.max_wind;
                    room.gameStart(self);
                  } //
                } //
              } else {
                self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.ROOM_DOES_NOT_EXIST, []));
              }
            });
            return null;
          }
        }
      }
    });
  }
}
