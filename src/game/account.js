var Types = require("./gametypes");
var Logger = require("./lib/logger");
var Message = require("./lib/message");
var Player = require("./player");
var Bot = require("./bot");
var Game = require("./game");
var Room = require("./room");
var ignoreCase = require("ignore-case");
var mysql = require("mysql");
var Commands = require("./commands");
var WebSocket = require("ws");
var fs = require("fs");
var db = require("./data");

const {
  secondsRemaining,
  pin_code_generador,
  getRndInteger,

  ArrayToObject,
} = require("./utils");

const AccountOpcodeHandler = require("./handler/account");

class Account {
  constructor(connection, gameserver, ip_actions) {
    this.ip_actions = ip_actions;
    this.connection = connection;
    this.gameserver = gameserver;
    this.con_id = connection.id;
    this.login_complete = false;
    this.player = null;
    this.user_id = null;
    this.last_message = 0;
    this.last_chat = ""; //Codigo De Spam
    this.strik = 0;
    this.room_number = 0;
    this.location_type = Types.LOCATION.CHANNEL;
    this.hasEnteredGame = false;
    this.room = null;
    this.ready = false;
    this.lucky_egg_start = 0;
    this.lucky_egg_sec_left = 0;
    this.commands = new Commands(this);
    this.connections = [];
    this.ignoredisconnect = false;

    this.registerListener();
  }

  registerListener() {
    // TODO: self
    const self = this;

    this.connection.listen(function (message) {
      var opcode = parseInt(message[0]);

      try {
        self.Handler(opcode, message);
      } catch (e) {
        Logger.debug("err: " + message);
        Logger.error("" + e.stack);
      }
    });

    this.connection.onClose(function () {
      //console.log("closing account...",self.user_id);
      if (self.ignoredisconnect) {
        return false;
      }
      //console.log("calling disconnect");
      self.disconnect();
    });
  }

  lucky_egg_left() {
    return this.lucky_egg_sec_left - (Date.now() - this.lucky_egg_start);
  }

  disconnect(cc = false) {
    if (this.room) {
      if (this.room.watchers[this.user_id]) {
        this.room.removeWatcher(this, true);
      } else {
        this.room.removePlayer(this);
      }
      //console.log("checking func after disconnect");
    }

    var lucky_egg_left = this.lucky_egg_left();

    this.gameserver.db.updateLuckyEggLeft(this.user_id, lucky_egg_left > 0 ? lucky_egg_left : 0);

    if (this.exit_callback) {
      this.exit_callback();
    }
  }

  check_messages() {
    var pending_messages = this.gameserver.pending_messages[this.user_id];

    if (pending_messages != undefined) {
      for (var i = 0; i < pending_messages.length; i++) {
        this.send(pending_messages[i]);
        this.gameserver.pending_messages[this.user_id].splice(i, 1);
      }
    }
  }

  unlocknewbot() {
    var new_bot_id = this.player.unlock + 1;

    if (new_bot_id < Types.COMPUTER_PLAYER.length) {
      var bot = Types.COMPUTER_PLAYER(new_bot_id);

      this.player.unlock = new_bot_id;
      this.gameserver.db.updateMaxBoss(this.user_id);
      this.sendMessage(new Message.loginResponse(this));

      var self = this;

      setTimeout(function () {
        self.send([Types.SERVER_OPCODE.alert2, 59, [bot.name, [bot.avatar.h, bot.avatar.b, null, null]]]);
      }, 2000);
    }
  }

  OpcodeHandlerResolve = {
    [Types.CLIENT_OPCODE.login]: this.handleLogin,
    [Types.CLIENT_OPCODE.get_avatar]: this.handleGetAvatar,
    [Types.CLIENT_OPCODE.get_my_avatars]: this.handleGetMyAvatar,
    [Types.CLIENT_OPCODE.chat]: this.handleChat,
    [Types.CLIENT_OPCODE.send_bcm]: this.handleSendBcm,
    [Types.CLIENT_OPCODE.pchat]: this.handlePchat,
    [Types.CLIENT_OPCODE.get_shop_page]: this.handleGetShopPage,
    [Types.CLIENT_OPCODE.buy]: this.handleBuy,
    [Types.CLIENT_OPCODE.delete_avatar]: this.handleDeleteAvatar,
    [Types.CLIENT_OPCODE.quick_join]: this.handleQuickJoin,
    [Types.CLIENT_OPCODE.use_exitem]: this.handleUseExitem,
    [Types.CLIENT_OPCODE.equip]: this.handleEquip,
    [Types.CLIENT_OPCODE.event]: this.handleEvent,
    [Types.CLIENT_OPCODE.change_name]: this.handleChangeName,
    [Types.CLIENT_OPCODE.tab]: this.handleTab,
    [Types.CLIENT_OPCODE.guild_create]: this.handleGuildCreate,
    [Types.CLIENT_OPCODE.guildinvite]: this.handleGuildinvite,
    [Types.CLIENT_OPCODE.guild_approved]: this.handleGuildApproved,
    [Types.CLIENT_OPCODE.guild_leave]: this.handleGuildLeave,
    [Types.CLIENT_OPCODE.guild_kick]: this.handleGuildKick,
    [Types.CLIENT_OPCODE.channel_rooms]: this.handleChannelRooms,
    [Types.CLIENT_OPCODE.get_room_info]: this.handleGetRoomInfo,
    [Types.CLIENT_OPCODE.getinfo]: this.handleGetinfo,
    [Types.CLIENT_OPCODE.channel_join]: this.handleChannelJoin,
    [Types.CLIENT_OPCODE.room_watch]: this.handleRoomWatch,
    [Types.CLIENT_OPCODE.room_join]: this.handleRoomJoin,
    [Types.CLIENT_OPCODE.room_create]: this.handleRoomCreate,
    [Types.CLIENT_OPCODE.room_options]: this.handleRoomOptions,
    [Types.CLIENT_OPCODE.tournament_start_game]: this.handleTournamentStartGame,
    [Types.CLIENT_OPCODE.tournament_cancel_wait]: this.handleTournamentCancelWait,
    [Types.CLIENT_OPCODE.create_team]: this.handleCreateTeam,
    [Types.CLIENT_OPCODE.game_share]: this.handleGameShare,
    [Types.CLIENT_OPCODE.room_title]: this.handleRoomTitle,
    [Types.CLIENT_OPCODE.room_change_ready]: this.handleRoomChangeReady,
    [Types.CLIENT_OPCODE.room_change_team]: this.handleRoomChangeTeam,
    [Types.CLIENT_OPCODE.room_change_host]: this.handleRoomChangeHost,
    [Types.CLIENT_OPCODE.select_bot]: this.handleSelectBot,
    [Types.CLIENT_OPCODE.mobile]: this.handleMobile,
    [Types.CLIENT_OPCODE.game_start]: this.handleGameStart,
    [Types.CLIENT_OPCODE.team_search_cancel]: this.handleTeamSearchCancel,
    [Types.CLIENT_OPCODE.game_items]: this.handleGameItems,
    [Types.CLIENT_OPCODE.game_use_item]: this.handleGameUseItem,
    [Types.CLIENT_OPCODE.started_to_shoot]: this.handleStartedToShoot,
    [Types.CLIENT_OPCODE.look]: this.handleLook,
    [Types.CLIENT_OPCODE.game_move]: this.handleGameMove,
    [Types.CLIENT_OPCODE.game_pass_turn]: this.handleGamePassTurn,
    [Types.CLIENT_OPCODE.game_shoot]: this.handleGameShoot,
    [Types.CLIENT_OPCODE.addfriend]: this.handleAddfriend,
    [Types.CLIENT_OPCODE.friend_approved]: this.handleFriendApproved,
    [Types.CLIENT_OPCODE.refresh_friends]: this.handleRefreshFriends,
    [Types.CLIENT_OPCODE.refresh_guildies]: this.handleRefreshGuildies,
    [Types.CLIENT_OPCODE.friend_delete]: this.handleFriendDelete,
    [Types.CLIENT_OPCODE.relationship_change]: this.handleRelationshipChange,
    [Types.CLIENT_OPCODE.relationship_approved]: this.handleRelationshipApproved,
  }

  Handler(opcode, message) {
    var self = this;
    const ip = this.connection._connection._socket.remoteAddress;

    const handler = this.OpcodeHandlerResolve[opcode];

    if (handler) {
      handler.call(this, message);
    } else {
    }
    Logger.info("Opcode: " + Types.getMessageTypeAsString(opcode) + " data: " + message);

    this.throttleAction();
  }

  // TODO
  throttleAction() {
    var self = this;
    const ip = this.connection._connection._socket.remoteAddress;
    var instant_action = 0;
    //console.log(ip);

    for (var i = 0; i < this.ip_actions[ip].actions.length; i++) {
      if (this.ip_actions[ip].actions[i + 1] != undefined) {
        var time_elapsed = this.ip_actions[ip].actions[i + 1] - this.ip_actions[ip].actions[i];
        if (time_elapsed < 500) {
          instant_action++;
        }
      }
    }

    if (instant_action > 10) {
      this.ip_actions[ip].baned = true;
      console.log("banned ip:" + ip);
      this.login_complete = false;
      this.connection._connection.close();
    }
  }

  Chat(msj, ch) {
    var self = this;
    var maxlng = 120;

    if (self.player.gm === 1) {
      maxlng = 150;
    }
    if (msj.length < 1) {
      return null;
    }
    if (msj.length > maxlng) {
      return null;
    }

    if (self.gameserver.name === "Prix" && this.player.gm === 0 && this.player.tournament_start_time_server <= Date.now() && this.player.tournament_end_time_server >= Date.now() || self.gameserver.name === "Guilds Prix" && this.player.gm === 0 && this.player.tournament_start_time_server <= Date.now() && this.player.tournament_end_time_server >= Date.now()) {
      //Codigo De Spam
      self.sendMessage(new Message.alertResponse("Hola " + this.player.game_id, "El Chat en el Lobby esta prohibido para los usuarios."));
      return null;
    }
    if (msj == this.last_chat && this.player.gm === 0) {
      //Codigo De Spam
      self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.CANT_DUP_CHAT, []));
      return null;
    }
    if (self.player.is_muted === true || self.player.is_muted >= Date.now()) {
      self.sendMessage(new Message.alert2Response(Types.ALERT2_TYPES.MUTED, []));
      return null;
    }
    if (self.player.rank < 5) {
      self.sendMessage(new Message.alertResponse("Hola " + this.player.game_id, "Tu Nivel <span class='span_rank rank rank" + self.player.rank + "'></span> Es Muy Bajo. <br>Nivel mínimo <span class='span_rank rank rank5'></span> es requerido para hablar en este chat. <br><br><a style='color:#fbf9f9;text-shadow: 0px 0px 2px #ff980099, 0px 0px 3px #ff830057, 0px 0px 7px #ff98005e, 0px 0px 5px #ff9b0066, 0px 0px 8px #ff980059, 0px 0px 8px #ff8f0070;'>Unete a nuestras redes sociales!!</a>. <br><br> <a href='https://www.facebook.com/groups/250371652898757' target='_blank'> <img width='40' height='40' target='_blank' src='/static/images/fbx.png'></a>&nbsp&nbsp<a href='https://chat.whatsapp.com/DMeNbEsnTbfDQWtwvDsq5d' target='_blank'> <img width='40' height='40' target='_blank' src='/static/images/wspp.png'></a><br>"));
      return null;
    }

    var date = Date.now();
    var cans = false;

    if (this.last_message < date) {
      cans = true;
      this.last_message = date + 1000;
    } else {
      this.strik += 1;
      if (this.strik > 4) {
        self.player.is_muted = true;
        var FinishDateMuted = Date.now() + 3600000;
        self.gameserver.db.updateMutedByIdAcc(FinishDateMuted, self.player.user_id);
      }
    }

    if (cans === true && self.player.is_muted !== true && self.player.is_muted != 1 || self.player.gm === 1) {
      var type = Types.CHAT_TYPE.NORMAL; //Types.CHAT_TYPE.GM;
      var save = true;
      var show = true;

      if (self.player.power_user === 1) {
        type = Types.CHAT_TYPE.POWER_USER;
      }
      if (self.player.gm === 1) {
        type = Types.CHAT_TYPE.GM;
      }
      if (self.player.rank === 28 && self.player.gm === 1 || self.player.rank === 29 && self.player.gm === 1 || self.player.rank === 30 && self.player.gm === 1) {
        type = Types.CHAT_TYPE.SPECIAL;
      }

      var rk = type == 4 || type == 0 ? this.player.rank : -1;

      if (show) {
        if (ch === true) {
          if (save === true) {
            self.gameserver.chathistory.push([msj, this.player.game_id, type, rk, this.player.guild]);
          }
          // console.log("pushBroadcastChannel");
          self.gameserver.pushBroadcastChannel(new Message.chatResponse(self, msj, type, this.player.rank));
        } else {
          //console.log('pushBroadcastChat');
          self.gameserver.pushBroadcastChat(new Message.chatResponse(self, msj, type), self.room);
        }
        this.last_chat = msj; //Codigo De Spam
      }
      //return false;
    }
  }

  saveWinDB() {
    var self = this;
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
      } else if (self.player.gp >= 8764 && current_rank == 11) {
        next_rank = 11;
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
      }
      if (self.player.rank != next_rank) {
        if (self.player.gender === "f") {
          tmpgender = 1;
        }
        if (self.player.rank <= 24) {
          self.player.scores_lose = 3;
          self.gameserver.db.updateRankByIdAcc(next_rank, self.player.user_id);
          self.player.rank = next_rank;

          // Award the prize
          awardPrize(gift_rank, cash);
        }
      }
    }

    function awardPrize(gift_rank, cash) {
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
    }

    var gp_power = 0;
    var plusgp = 0;
    var relation_status = 0;
    var lucky_egg_gp = 0;

    if (self.player.power_user === 1) {
      gp_power = parseInt(Math.round(self.player.win_gp * 10 / 100));
    }
    if (self.lucky_egg_left() > 0) {
      lucky_egg_gp = self.player.win_gp;
    }
    if (self.player.plus10gp === 1) {
      plusgp = parseInt(Math.round(self.player.win_gp * 10 / 100));
    }
    if (self.player.relationship_status === "f") {
      relation_status = parseInt(Math.round(self.player.win_gp * 10 / 100));
    }
    if (self.player.relationship_status === "e") {
      relation_status = parseInt(Math.round(self.player.win_gp * 20 / 100));
    }
    if (self.player.relationship_status === "m") {
      relation_status = parseInt(Math.round(self.player.win_gp * 30 / 100));
    }

    self.player.win_gp = parseInt(Math.round(gp_power + plusgp + relation_status + lucky_egg_gp) + self.player.win_gp);
    self.player.gp = parseInt(self.player.gp + self.player.win_gp); // GPs Ganados.

    self.gameserver.db.updateUser(self).then(function (data) {
      if (data.error_mysql || data.error_querry) {} else {
        self.player.win_gold = 0;
        self.player.win_gp = 0;
        self.player.is_win = 0;
        self.player.is_loss = 0;
        self.player.is_ready = 0;
        self.sendMessage(new Message.loginResponse(self));
        self.gameserver.sendAccountsOnline();
        self.room.RoomUpdate(self);
      }
    });
  }

  send(data) {
    if (this.connection._connection.readyState === WebSocket.OPEN) {
      this.connection.send(data);
    }
  }

  sendMessage(message) {
    if (this.connection._connection.readyState === WebSocket.OPEN) {
      message = message.serialize();

      this.connection.send(message);
    }
  }

  onExit(callback) {
    this.exit_callback = callback;
  }

  update(tiempo1, tiempo2) {
    const self = this;

    if (self.room) {
      const map = self.room.game.map;

      if (self.player.x > map.w || self.player.y > map.h) {
        self.player.is_alive = 0;
      }

      const yf = map.GetUnder(self.player.x, self.player.y);

      if (yf === 0) {
        self.player.is_alive = 0;
      } else {
        self.player.y = yf;
      }

      self.player.move(tiempo1, tiempo2);

      return yf;
    }
  }

  dead() {
    const self = this;

    self.player.is_alive = 0;
    self.room.game.checkDead();
  }

  onCreateBot({
    positionOfBot,
    bot_id,
  }) {
    var self = this;
    let id = bot_id;

    let bot_data = {
      user_id: bot_id,
      bot_id: bot_id,
      reg_id: 0,
      game_id: Types.COMPUTER_PLAYER[bot_id].game_id,
      rank: Types.COMPUTER_PLAYER[bot_id].rank,
      gp: 0,
      gold: 0,
      cash: 0,
      gender: "m",
      photo_url: "",
      ahead: Types.COMPUTER_PLAYER[bot_id].ahead,
      abody: Types.COMPUTER_PLAYER[bot_id].abody,
      aeyes: Types.COMPUTER_PLAYER[bot_id].aeyes,
      aflag: Types.COMPUTER_PLAYER[bot_id].aflag,
      abackground: 0,
      aforeground: 0,
      is_bot: true
    };

    let botUserId = 1e+300 + id;
    var plx = new Player(bot_data);
    plx.is_bot = 1;
    plx.is_ready = 1;
    plx.mobile = Types.COMPUTER_PLAYER[bot_id].mobile;
    plx.scores_lose = 1;
    plx.position = positionOfBot;
    plx.user_id = botUserId;
    let acc = new Bot(plx);
    acc.user_id = botUserId;
    acc.gameserver = self.gameserver;
    self.gameserver.bots[acc.user_id] = acc;
    self.room.addBot(acc);
    let data_bot = {
      position: positionOfBot,
      id: bot_id,
      name: bot_data.game_id,
    };

    self.room.accountsOfBot.push(data_bot);
  }
};

Object.assign(Account.prototype, AccountOpcodeHandler);

module.exports = Account;
