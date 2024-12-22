const Message = require("../../lib/message");

var Types = require("../../gametypes");
var Player = require("../../player");

module.exports = function handleLogin(message) {
  const self = this;

  let _ver = parseInt(message[1]);
  let _id = parseInt(message[2]);
  let _session = message[3];
  let _hash = parseInt(message[4]);
  let _last_win = parseInt(message[5]);
  //Logger.info('Ver: '+_ver+' - Id: '+_id+' - session: '+_session+' - hash: '+_hash+' - last_win: '+_last_win);
  //Logger.normal("Login: "+JSON.stringify(message));

  if (typeof _id !== "number") {
    self.sendMessage(new Message.alertResponse(":)", "Que haces? Ctrl+F5"));
    console.log("login incomplete 0 ", opcode);
    self.connection.close();
    return null;
  }
  self.gameserver.db.getPlayerData(_id, _session).then(function (data) {
    if (data.banned === 1) {
      self.gameserver.db.getUserByBannedTest(data.user_id).then(function (dbplaytt) {
        var ban_inf = dbplaytt[0][0];
        self.send([17, "Estás Baneado", "Motivo: " + ban_inf.razon + "<br><br>Hasta: undefined"]);
        console.log("login incomplete 1 ", opcode);
        self.connection.close();
      });
    } else if (data.error_mysql || data.error_querry) {
      self.sendMessage(new Message.alertResponse(":)", "Error Servidor!"));
      console.log("login incomplete 2 ", opcode);
      self.connection.close();
    } else if (data.error_session || data.error_exist) {
      self.sendMessage(new Message.alertResponse(":)", "Que haces? Ctrl+F5"));
      console.log("login incomplete 3 ", opcode);
      self.connection.close();
    } else {
      self.send([Types.SERVER_OPCODE.login_profile]);
      self.gameserver.checkAccountOnlineAndClose(data.user_id, function () {
        var otheraccount = self.gameserver.searchAccountById(data.user_id);
        if (otheraccount !== null) {
          otheraccount.send([Types.SERVER_OPCODE.disconnect_reason, 3, null]);
          otheraccount.ignoredisconnect = true;
          otheraccount.connection.close();
          otheraccount.disconnect();
          //console.log("account finalized");
        }
        self.send([Types.SERVER_OPCODE.login_avatars]);
        self.user_id = data.user_id;
        self.is_muted = data.is_muted;
        self.player = new Player(data);
        self.login_complete = true;
        self.location_type = Types.LOCATION.CHANNEL;
        //if (self.player.rank === 26 && self.player.guild !== 'GM' || self.player.rank === 27 && self.player.guild !== 'GM' || self.player.rank === 31 && self.player.guild !== 'GM') {
        //    self.player.guild = '';
        //}
        self.lucky_egg_start = Date.now();
        self.lucky_egg_sec_left = data.lucky_egg_sec_left == "" ? 0 : parseInt(data.lucky_egg_sec_left);
        self.sendMessage(new Message.loginResponse(self));
        self.gameserver.addAccount(self);
        self.gameserver.enter_callback(self);
        //self.gameserver.db.viewsServer1(self.gameserver.id);
        if (self.player.rank >= 0) {
          if (self.gameserver.id === 2) {
            self.player.tournament = [0, 0, 2, 0, 0, -2, "", 10, 14, 1, [1, 3, 8, 9, 10], 0, 1, 0, 0, 0, 0, false, [], 100, 15];
            self.sendMessage(new Message.loginResponse(self));
          } else if (self.gameserver.id === 7) {
            self.player.tournament = [0, 0, 2, 1, 0, -1, "", 191588, 68, 25, [0, 1, 9, 13], 0, 1, 0, 0, 0, -100000, null, [], 100, 20, 0];
            self.sendMessage(new Message.loginResponse(self));
          } else if (self.gameserver.id === 6) {
            //start_time end_time players avatar_on max_wind force_mobile name total_games last_5_minutes_games rooms maps game_mode s1 tp save_personal save_guild min_points different_mobiles gifts gp_event
            self.player.tournament = [0, 0, 0, 1, 50, -1, "", 1788581, 953, 293, [4, 40], 0, 1, 0, 0, 0, 0, false, [], 100, 20, 0];
            self.sendMessage(new Message.loginResponse(self));
          } else if (self.gameserver.id === 3) {
            self.player.tournament = [0, 0, 2, 0, 0, -1, "", 10, 14, 1, [5, 9], 0, 1, 0, 0, 0, -100000, false, [], 100, 10];
            self.sendMessage(new Message.loginResponse(self));
          } else {}
          let next_rank = 0;
          let tmpgender = 0;
          let cash = 0;
          let gift_rank = 0;
          let self2 = self.gameserver.getAccountById(parseInt(self.player.user_id));
          let check_ranks = JSON.parse(self.player.first_important_ranks);
          let current_rank;
          let previous_rank;
          async function getCurrentRank() {
            try {
              current_rank = await self.gameserver.db.getPlayerCurrentRank(self.player.user_id);
              previous_rank = await self.gameserver.db.getPlayerPreviousRank(self.player.user_id);
              processRanks();
            } catch (error) {
              console.error("Error fetching ranks:", error);
            }
          }

          // Call the async function
          getCurrentRank();
          function processRanks() {
            if (self.player.gp <= 1099) {
              next_rank = 0;
            } else if (self.player.gp >= 1100 && self.player.gp <= 1199) {
              next_rank = 1;
              gift_rank = 9333;
              cash = 3000;
            } else if (self.player.gp >= 1200 && self.player.gp <= 1499) {
              next_rank = 2;
              gift_rank = 9334;
              cash = 3000;
            } else if (self.player.gp >= 1500 && self.player.gp <= 1799) {
              next_rank = 3;
              gift_rank = 9335;
              cash = 3000;
            } else if (self.player.gp >= 1800 && self.player.gp <= 2299) {
              next_rank = 4;
              gift_rank = 9336;
              cash = 3000;
            } else if (self.player.gp >= 2300 && self.player.gp <= 2799) {
              next_rank = 5;
              gift_rank = 9337;
              cash = 3000;
            } else if (self.player.gp >= 2800 && self.player.gp <= 3499) {
              next_rank = 6;
              gift_rank = 9338;
              cash = 3000;
            } else if (self.player.gp >= 3500 && self.player.gp <= 4199) {
              next_rank = 7;
              gift_rank = 9339;
              cash = 3000;
            } else if (self.player.gp >= 4200 && self.player.gp <= 5099) {
              next_rank = 8;
              gift_rank = 9340;
              cash = 3000;
            } else if (self.player.gp >= 5100 && self.player.gp <= 5999) {
              next_rank = 9;
              gift_rank = 9341;
              cash = 3000;
            } else if (self.player.gp >= 6000 && self.player.gp <= 6899) {
              next_rank = 10;
              gift_rank = 9342;
              cash = 3000;
            } else if (self.player.gp >= 6900 && self.player.gp <= 8764) {
              next_rank = 11;
              gift_rank = 9343;
              cash = 3000;
            } else if (self.player.gp >= 8764 && current_rank <= 11) {
              next_rank = current_rank;
            } else if (current_rank == 12) {
              next_rank = 12;
              gift_rank = 9344;
              cash = 3000;
            } else if (current_rank == 13) {
              next_rank = 13;
              gift_rank = 9345;
              cash = 3000;
            } else if (current_rank == 14) {
              next_rank = 14;
              gift_rank = 9346;
              cash = 3000;
            } else if (current_rank == 15) {
              next_rank = 15;
              gift_rank = 9347;
              cash = 3000;
            } else if (current_rank == 16) {
              next_rank = 16;
              gift_rank = 9348;
              cash = 3000;
            } else if (current_rank == 17) {
              next_rank = 17;
              gift_rank = 9349;
              cash = 3000;
            } else if (current_rank == 18) {
              next_rank = 18;
              gift_rank = 9350;
              cash = 3000;
            } else if (current_rank == 19) {
              next_rank = 19;
              gift_rank = 9351;
              cash = 3000;
            } else if (current_rank == 20) {
              next_rank = 20;
              gift_rank = 9352;
              cash = 3000;
            } else if (current_rank == 21) {
              next_rank = 21;
              gift_rank = 9353;
              cash = 3000;
            } else if (current_rank == 22) {
              next_rank = 22;
              gift_rank = 9354;
              cash = 3000;
            } else if (current_rank == 23) {
              next_rank = 23;
              gift_rank = 9355;
              cash = 3000;
            } else if (current_rank == 24) {
              next_rank = 24;
              gift_rank = 9356;
              cash = 3000;
            } else {}
            self.gameserver.db.getPlayerPreviousRank(self.player.user_id).then(previous_rank => {
              if (self.player.rank > 11 && previous_rank != self.player.rank) {
                previous_rank = self.player.rank;
                self.gameserver.db.updatePreviousRank(previous_rank, self.player.user_id);
                self.gameserver.db.getBoy(parseInt(self.player.user_id), parseInt(gift_rank)).then(function (acc) {}).catch(function (err) {
                  let datasendgift = {
                    UserId: self.player.user_id,
                    aId: gift_rank,
                    type: 0,
                    expire_time: 0,
                    is_cash: 0,
                    is_gift: 1,
                    gift_sent_by: self.player.user_id,
                    amount: 0,
                    date_ava_time: Date.now()
                  };
                  self.gameserver.db.putUserAvatars(datasendgift);
                  var name_ava_gift = self.gameserver.avatars.getAvatagift(gift_rank);
                  self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.RECEIVED_AVATAR, ["FunnyBound", gift_rank, 0, "Congratulations you have leveled up and thanks to your effort we will reward you with this avatar", "forever", name_ava_gift]));
                  self.gameserver.db.sendCash(cash, self.player.user_id);
                  self2.send([17, "Received Cash! :)", "You just received <font color='yellow'>" + cash + "</font> Cash from<br><font color='yellow'>" + self.player.game_id + "</font>.<br><br>And cash for Rank up <font color='cyan'><span class='span_rank rank rank" + next_rank + "'></span></font>.<br><br>Thank You!"]);
                  self2.player.cash += cash;
                });
                self.sendMessage(new Message.loginResponse(self));
                self.gameserver.sendAccountsOnline();
              }
            });
            if (self.player.rank != next_rank) {
              if (self.player.gender === "f") {
                tmpgender = 1;
              }
              if (self.player.rank <= 24) {
                self.gameserver.db.updateRankByIdAcc(next_rank, self.player.user_id);
                self.player.rank = next_rank;
                //self.gameserver.db.sendGift(self.player.user_id, gift_rank);
                self.gameserver.db.getBoy(parseInt(self.player.user_id), parseInt(gift_rank)).then(function (acc) {}).catch(function (err) {
                  let datasendgift = {
                    UserId: self.player.user_id,
                    aId: gift_rank,
                    type: 0,
                    expire_time: 0,
                    is_cash: 0,
                    is_gift: 1,
                    gift_sent_by: self.player.user_id,
                    amount: 0,
                    date_ava_time: Date.now()
                  };
                  self.gameserver.db.putUserAvatars(datasendgift);
                  var name_ava_gift = self.gameserver.avatars.getAvatagift(gift_rank);
                  self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.RECEIVED_AVATAR, ["FunnyBound", gift_rank, 0, "Congratulations you have leveled up and thanks to your effort we will reward you with this avatar", "forever", name_ava_gift]));
                  self.gameserver.db.sendCash(cash, self.player.user_id);
                  self2.send([17, "Received Cash! :)", "You just received <font color='yellow'>" + cash + "</font> Cash from<br><font color='yellow'>" + self.player.game_id + "</font>.<br><br>And cash for Rank up <font color='cyan'><span class='span_rank rank rank" + next_rank + "'></span></font>.<br><br>Thank You!"]);
                  self2.player.cash += cash;
                });
                self.sendMessage(new Message.loginResponse(self));
                self.gameserver.sendAccountsOnline();
              }
            }
            if (self.player.power_user === 1) {
              self.gameserver.db.getAvatarExpireExItem(self.player.user_id, 464).then(function (data) {}).catch(function (err) {
                self.gameserver.db.updatePowerUser(0, self.player.user_id);
                self.player.power_user = 0;
                self.sendMessage(new Message.loginResponse(self));
                self.gameserver.sendAccountsOnline();
              });
            }
          }
        }
        self.gameserver.db.updateServerByUserId(self.gameserver.id, self.player.user_id);
        self.gameserver.last_account_info[self.user_id] = {
          user_id: self.user_id,
          rank: self.player.rank,
          guild: self.player.guild,
          country: self.player.country
        };
        //self.gameserver.account_check[self.gameserver.id].accounts_server += 1;
        self.check_messages();
        /*if (self.player.win === 0 && self.player.loss === 0) {
          self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.RECEIVED_AVATAR, ["ThorBound", 8142, 0, "Welcome Gift", "forever", "Chicken [Head]"]));
          self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.RECEIVED_AVATAR, ["ThorBound", 8143, 0, "Welcome Gift", "forever", "Chicken [Body]"]));
          self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.RECEIVED_AVATAR, ["ThorBound", 748554, 0, "Welcome Gift", "forever", "Chastifall (RARE) [Flag]"]));
        }*/
        /*if (1559602800000 >= Date.now()) {
          self.send([17,"¡PROMOCIÓN!",'Promoción de cash por tiempo limitado, aprovecha esta gran oferta y recibe 2 RANGOS ESPECIALES + 170,000 de cash. <a style="color:#fbf9f9;text-shadow: 0px 0px 2px #ff980099, 0px 0px 3px #ff830057, 0px 0px 7px #ff98005e, 0px 0px 5px #ff9b0066, 0px 0px 8px #ff980059, 0px 0px 8px #ff8f0070;" href="/cash" target="_blank">¡RECARGA YA! - ¡Click Aqui!</a>']);
        }*/
        //self.send([17,"¡ALERTA!",'El servidor se encuentra en mantenimiento durante unas horas, le recomendamos no jugar por el momento, gracias por su comprension']);
      });
    }
  }).catch(function (err) {
    console.log("login incomplete 4 ", err);
    self.connection.close();
  });
}
