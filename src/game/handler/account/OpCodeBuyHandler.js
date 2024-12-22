const Message = require("../../lib/message");

var Types = require("../../gametypes");
var Player = require("../../player");

module.exports = function handleBuy(message) {
  const self = this;

  // seguridad
  if (!self.login_complete) {
    console.log("login incomplete", opcode);
    self.connection.close();
    return null;
  }
  let id = parseInt(message[1]);
  let is_cash = message[2];
  let period = message[3];
  let user_gift = message[5];
  let nota_gift = message[6];
  var tmpgender = 0;
  if (self.player.gender === "f") {
    tmpgender = 1;
  }
  if (user_gift !== "") {
    self.gameserver.forEachAccount(function (account) {
      if (account !== null) {
        if (account.player.game_id === user_gift) {
          if (account.player.gender === "f") {
            tmpgender = 1;
          } else if (self.player.gender === "f" && account.player.gender === "m") {
            tmpgender = 0;
          } else {}
        }
      }
    });
  }
  var item_data = self.gameserver.avatars.getAvatar2(id, tmpgender);
  if (item_data) {
    var _iprecio = 99999999999;
    var valid_precio = false;
    var errtrampa = false;
    var dat = Date.now();
    var timerank = Date.now();
    var aceptrankspecial = "no";
    var rankspecial = 0;
    var megaponeuses = 0;
    if (item_data[6] === "") {
      errtrampa = true;
    }
    if (item_data[6].min_rank > self.player.rank) {
      self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.NOT_FOR_SELL, []));
      return null;
    }
    if (period === Types.PERIOD.WEEK) {
      megaponeuses = 30;
      dat = dat + 604800000;
      if (is_cash) {
        _iprecio = item_data[6].cash_week;
        if (item_data[6].cash_week <= 0) {
          errtrampa = true;
        }
      } else {
        _iprecio = item_data[6].gold_week;
        if (item_data[6].gold_week <= 0) {
          errtrampa = true;
        }
      }
    } else if (period === Types.PERIOD.MONTH) {
      megaponeuses = 50;
      dat = dat + 2592000000;
      if (is_cash) {
        _iprecio = item_data[6].cash_month;
        if (item_data[6].cash_month <= 0) {
          errtrampa = true;
        }
      } else {
        _iprecio = item_data[6].gold_month;
        if (item_data[6].gold_month <= 0) {
          errtrampa = true;
        }
      }
    } else if (period === Types.PERIOD.PERM) {
      megaponeuses = 100;
      dat = 0;
      if (is_cash) {
        _iprecio = item_data[6].cash_perm;
        if (item_data[6].cash_perm <= 0) {
          errtrampa = true;
        }
      } else {
        _iprecio = item_data[6].gold_perm;
        if (item_data[6].gold_perm <= 0) {
          errtrampa = true;
        }
      }
    }
    if (is_cash) {
      if (self.player.cash >= _iprecio) {
        valid_precio = true;
      }
    } else if (self.player.gold >= _iprecio) {
      valid_precio = true;
    }
    if (id === 1066 && self.player.gm === 1 || id === 1067 && self.player.gm === 1 || id === 1068 && self.player.gm === 1) {
      return null;
    }
    if (user_gift !== "") {
      self.gameserver.db.getUserByGameId(user_gift).then(function (rows) {
        var info_user = rows[0][0];
        let self2 = self.gameserver.getAccountById(parseInt(info_user.IdAcc));
        if (id === 1066 && self2.player.gm === 1 || id === 1067 && self2.player.gm === 1 || id === 1068 && self2.player.gm === 1) {
          return null;
        }
        /*if (self.player.rank === 26 && is_cash === true || self.player.rank === 27 && is_cash === true || self.player.rank === 31 && is_cash === true) {
            self.send([17,"PROHIBITED","This option is prohibited for your rank"]);
            return null;
          } */
        /*if (id === 2319 && self.player.rank !== 26) {
                              self.sendMessage(new Message.alertResponse("Lo sentimos", "Este Item no se puede Regalar.."));
                              return null;
                          }
          if (self.player.user_id === 4) {
                              self.sendMessage(new Message.alertResponse("Lo sentimos Jorge", "Esta opción esta Prohibida. De insistir todo tiene un registro ATTE: Berny."));
                              return null;
                          }
          if (self.player.user_id === 6) {
                              self.sendMessage(new Message.alertResponse("Lo sentimos Johnatan", "Esta opción esta Prohibida. De insistir todo tiene un registro ATTE: Berny."));
                              return null;
                          }*/
        if (valid_precio && !errtrampa) {
          let data = {
            UserId: self2.user_id,
            aId: id,
            type: item_data[2],
            expire_time: dat,
            is_cash: is_cash === true ? 1 : 0,
            is_gift: 1,
            gift_sent_by: self.player.user_id,
            amount: 0,
            date_ava_time: Date.now()
          };
          if (id == 2319) {
            //lucky egg
            let eggAmount = [1, 8, 25];
            data.expire_time = 0;
            data.amount = eggAmount[period];
          } else if (id == 894) {
            //megaphone
            let bugleAmount = [30, 50, 100];
            data.expire_time = 0;
            data.amount = bugleAmount[period];
          } else if (id == 1060 || id == 1061 || id == 1062 || id == 1063 || id == 1064 || id == 1065) {
            data.expire_time = 0;
            data.amount = 1;
          }
          if (_iprecio <= 0) {}
          if (self.player.rank < 17) {
            self.sendMessage(new Message.alertResponse("Lo sentimos :(", "Tu nivel no es suficiente para enviar el regalo.", []));
          } else {
            self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.GIFT_SENT, [id]));
            Promise.all([self.gameserver.db.putUserAvatars(data)]).then(data => {
              self2.gameserver.db.getPlayerAvatars(self2).then(function (data) {
                if (data.error_mysql || data.error_querry) {} else {
                  var dat = self2.gameserver.avatars.getAvatarDataList(data.data_list);
                  self2.sendMessage(new Message.myAvatars(self2, dat));
                }
              });
            });
            self.sendMessage(new Message.loginResponse(self));
            try {
              var name_ava_gift = self.gameserver.avatars.getAvatagift(id);
              self2.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.RECEIVED_AVATAR, [self.player.game_id, id, 0, nota_gift, "forever", name_ava_gift]));
              if (id === 464) {
                self.gameserver.db.updatePowerUser(1, self2.player.user_id);
                self2.player.power_user = 1;
              }
              if (id === 893) {
                self.gameserver.db.updatePlusGP(self2.player.user_id);
                self2.player.plus10gp = 1;
              }
              if (id === 894) {
                self.gameserver.db.updateMegaPone(megaponeuses, self2.player.user_id);
                self2.player.megaphones = megaponeuses;
              }
              if (id === 1223) {
                self.gameserver.db.updateMaps(self2.player.user_id);
                self2.player.maps_pack = 1;
              }
              if (id === 1066) {
                timerank = timerank + 864000000;
                rankspecial = 28;
                aceptrankspecial = "se";
              }
              if (id === 1067) {
                timerank = timerank + 1209600000;
                rankspecial = 29;
                aceptrankspecial = "se";
              }
              if (id === 1068) {
                timerank = timerank + 1555200000;
                rankspecial = 30;
                aceptrankspecial = "se";
              }
              if (aceptrankspecial === "se") {
                self.gameserver.db.updateRankSpecialByIdAcc(rankspecial, 1, self2.player.user_id);
                self.gameserver.db.putSpecialRanksByUserId(self2.player.user_id, self2.player.game_id, rankspecial, _iprecio, timerank);
                self2.player.rank = rankspecial;
                self2.sendMessage(new Message.loginResponse(self2));
                self.gameserver.sendAccountsOnline();
              }
            } catch (e) {
              Logger.error(e);
            }
            if (is_cash === true) {
              self.player.cash = parseInt(self.player.cash - _iprecio);
              self.gameserver.db.sendDeleteCash(0, _iprecio, self.player.user_id);
            } else {
              self.player.gold = parseInt(self.player.gold - _iprecio);
              self.gameserver.db.sendDeleteCash(_iprecio, 0, self.player.user_id);
            }
            self.sendMessage(new Message.loginResponse(self));
          }
        } else {
          self.send([40, 60]);
        }
      });
    } else if (valid_precio && !errtrampa) {
      let data = {
        UserId: self.user_id,
        aId: id,
        type: item_data[2],
        expire_time: dat,
        is_cash: is_cash === true ? 1 : 0,
        is_gift: 0,
        gift_sent_by: 0,
        amount: 0,
        date_ava_time: Date.now()
      };
      if (id == 2319) {
        //lucky egg
        let eggAmount = [1, 8, 25];
        data.expire_time = 0;
        data.amount = eggAmount[period];
      } else if (id == 894) {
        //megaphone
        let bugleAmount = [30, 50, 100];
        data.expire_time = 0;
        data.amount = bugleAmount[period];
      } else if (id == 1060 || id == 1061 || id == 1062 || id == 1063 || id == 1064 || id == 1065) {
        data.expire_time = 0;
        data.amount = 1;
      }
      if (_iprecio <= 0) {} else {
        self.gameserver.db.getBoy(self.player.user_id, id).then(function (acc) {
          self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.ALREADY_HAVE, []));
        }).catch(function (err) {
          self.gameserver.db.buyAvatarForAccount(self.user_id, is_cash, _iprecio, data).then(function (data) {
            if (data.error_mysql || data.error_querry) {} else {
              self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.PURCHASED, [id]));
              self.gameserver.db.getPlayerAvatars(self).then(function (data) {
                if (data.error_mysql || data.error_querry) {} else {
                  var dat = self.gameserver.avatars.getAvatarDataList(data.data_list);
                  self.sendMessage(new Message.myAvatars(self, dat));
                }
              });
              if (id === 464) {
                self.gameserver.db.updatePowerUser(1, self.player.user_id);
                self.player.power_user = 1;
              }
              if (id === 893) {
                self.gameserver.db.updatePlusGP(self.player.user_id);
                self.player.plus10gp = 1;
              }
              if (id === 894) {
                self.gameserver.db.updateMegaPone(megaponeuses, self.player.user_id);
                self.player.megaphones = megaponeuses;
              }
              if (id === 1223) {
                self.gameserver.db.updateMaps(self.player.user_id);
                self.player.maps_pack = 1;
              }
              if (id === 1066) {
                timerank = timerank + 864000000;
                rankspecial = 28;
                aceptrankspecial = "se";
              }
              if (id === 1067) {
                timerank = timerank + 1209600000;
                rankspecial = 29;
                aceptrankspecial = "se";
              }
              if (id === 1068) {
                timerank = timerank + 1555200000;
                rankspecial = 30;
                aceptrankspecial = "se";
              }
              if (aceptrankspecial === "se") {
                self.gameserver.db.updateRankSpecialByIdAcc(rankspecial, 1, self.player.user_id);
                self.gameserver.db.putSpecialRanksByUserId(self.player.user_id, self.player.game_id, rankspecial, _iprecio, timerank);
                self.player.rank = rankspecial;
                self.sendMessage(new Message.loginResponse(self));
                self.gameserver.sendAccountsOnline();
              }
              if (is_cash === true) {
                self.player.cash = parseInt(self.player.cash - _iprecio);
              } else {
                self.player.gold = parseInt(self.player.gold - _iprecio);
              }
              self.sendMessage(new Message.loginResponse(self));
            }
          }).catch(function (err) {
            Logger.error("" + err.stack);
          });
        });
      }
    } else {
      self.send([40, 60]);
    }
  } else {
    self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.AVATAR_WRONG_GENDER, []));
  }
}
