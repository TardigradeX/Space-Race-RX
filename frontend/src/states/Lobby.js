import Phaser from 'phaser'
import config from '../config'
import {DELIMETER, targets, commands, payloads, NONE, NEW, TARGET_DELIMETER} from "../commands";
import {Player} from "../Player";

export default class extends Phaser.State {

    init () {
      this.xbutton = 80;
      this.ybutton = 120;
      this.yoffset = 60;
      this.pbuttons = [];

      this.players = [];
      this.playerReady = [];
      this.roomId = "";
    }

    preload () {

      this.load.image('button', 'assets/images/small_button.png');
      this.websocket = new WebSocket(config.wsServerAddress);

      this.websocket.onopen = function () {
          console.log("OPENED SOCKET");
          let msg, target;
          target = targets.SERVER + TARGET_DELIMETER + NONE + TARGET_DELIMETER + NONE
          msg = commands.LOGIN + DELIMETER + target + DELIMETER + NONE;
          console.log("Sending login:",msg);
          this.send(msg)
      };

      this.websocket.onerror = function (error) {
          console.log('WebSocket Error: ' + error);
      };

      this.websocket.onmessage = function (message) {
          console.log("MESSAGE: " + message.data);
          this.parse(message.data);
      }.bind(this);

      this.websocket.onclose = function(close){
        console.log("Sending log out");
        let target, payload, msg;
        target = targets.SERVER + TARGET_DELIMETER + NONE + TARGET_DELIMETER + NONE
        payload = NONE
        msg = commands.LOGOUT + DELIMETER + targets + DELIMETER + payload
        this.websocket.send(msg)
        this.state.start("DummyDecide")
      }.bind(this)
    }

    create () {
        this.buttonMaster = this.game.add.button(this.game.world.centerX - 95, 200, 'button', this.startGame, this, 2, 1, 0);
    }

    startGame() {
        this.state.start('Game', false, false, this.websocket, this.roomId, this.players);

    }

    addPlayer(playerId){
      var x,y, offset;
      this.players.push(new Player(playerId));
      this.playerReady.push(0)
      x = this.xbutton
      y = this.ybutton
      console.log("New Player - adding button");
      pbutton = this.game.add.button(x, y + offset*this.players.length, 'button')

    }

    parse(message){
        let mySplit = message.split(DELIMETER);

        if (mySplit.length != 3){
          console.log("Not a command, ignore");
          return(NONE)
        }

        let cmd = mySplit[0];
        let target = mySplit[1];
        let payload = mySplit[2];
        console.log("Command:", cmd);
        if(cmd == commands.LOGIN){
          /**
           Login cases:
           1) Login response for master
              message: login|master,<roomid>,none|none
           2) Sign up notification for controller
              message: login|master,<roomid>,<playerid>|none
          **/
          if (payload == payloads.SIGNUP) {
              this.roomId = target.split(TARGET_DELIMETER)[1];
          }
          if (payload == payloads.JOINED){
            let playerId = target.split(TARGET_DELIMETER)[2];
            this.addPlayer(playerId)
          }
        }
        if (cmd == commands.THRUST){
          let playerId = target.split(TARGET_DELIMETER)[2];
          this.playerReady[parseInt(playerId) - 1] = 1
        }
        if (cmd == commands.LEFTROLL){
          console.log("Should set player ready to 0");
          let playerId = target.split(TARGET_DELIMETER)[2];
          this.playerReady[parseInt(playerId) - 1] = 1
        }
        if (cmd == commands.RIGHTROLL){
          console.log("Should set player ready to 0");
          let playerId = target.split(TARGET_DELIMETER)[2];
          this.playerReady[parseInt(playerId) - 1] = 1
        }
        if (cmd == commands.NONE){
          let playerId = target.split(TARGET_DELIMETER)[2];
          this.playerReady[parseInt(playerId) - 1] = 0
        }

        if (cmd == commands.THRUST |
            cmd == commands.LEFTROLL |
            cmd == commands.RIGHTROLL |
            cmd == commands.NONE) {
              let playerId = target.split(TARGET_DELIMETER)[2];
              console.log(parseInt(playerId) -1, this.playerReady);
            }
    }

    update () {
        if (this.roomId.length > 0) {
            let text = this.game.add.text(this.game.width / 2, 70, this.roomId);
        }
    }
}
