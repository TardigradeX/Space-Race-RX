import Phaser from 'phaser'
import config from '../config'

import VisualTimer from '../vendor/VisualTimer.js'

import {DELIMETER, targets, commands, payloads, NONE, NEW, TARGET_DELIMETER} from "../commands";
import {Player} from "../Player";

export default class extends Phaser.State {


    init () {
      this.xbutton = 20;
      this.ybutton = 120;
      this.yoffset = 64 + 10;
      this.psigns = [];
      this.pReady = [];

      this.players = [];
      this.playerReady = [];
      this.roomId = "";
    }

    preload () {

      game.load.spritesheet('timer', './assets/images/timer.png', 150, 20);

      this.load.spritesheet('readyState', 'assets/images/sign-lobby_spriteSheet.png',64 ,64, 2);

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

      this.indicator = new VisualTimer({
					game: this.game,
					x: this.game.world.centerX - 95 - 45,
					y: 200,
					seconds: 5,
					onComplete: function() { console.log('>>> Go Go Go') }
				});
        this.game.add.text(this.game.world.centerX - 95 - 60, 230, "until game start");
    }

    allReady(playerStates){
      if(playerStates.length === 0){
        return(false)
      }
      var n = playerStates.reduce(function(pv, cv) { return pv + cv; }, 0);
      if (n === playerStates.length){
          this.indicator.start();
          return(true);
      } else {
          this.indicator.stop();
          this.indicator.reset();
          return(false);
      }
    }

    showReadyState(player, psign){
      if(player === null){
        return(null)
      }
      if (player === 1){
        psign.frame = 1;
        return(true)
      } else {
        psign.frame = 0;
        return(false)
      }
    }

    startGame() {
      this.state.start('Game', true, false, this.websocket, this.roomId, this.players);
    }

    addPlayer(playerId){
      var i, k;
      i = this.psigns.findIndex(function(player){return(player === null);})
      if(i === -1){ i = this.psigns.length }
      k = i + 1

      var x, y, offset, psign, text1;
      x = this.xbutton;
      y = this.ybutton;
      offset = this.yoffset;

      // pbutton = this.game.add.button(x, y + (offset*k), 'button');
      psign = this.game.add.sprite(x, y + (offset*k) , 'readyState', 0 )
      text1 = this.game.add.text(x + 64 + 5, y + (offset*k) + 18, "Player"+ (k));
      psign.text = text1

      if (k == this.psigns.length){
        this.players.push(new Player(playerId));
        this.psigns.push(psign)
        this.playerReady.push(0);
      } else {
        this.psigns[i] = psign
        this.players[i] = new Player(playerId);
        this.playerReady[i] = 0;
      }
    }

    removePlayer(playerId){
      var i = parseInt(playerId) - 1

      if( this.psigns[i] === null) {
        return(NONE);
      }
      let cbutton = this.psigns[i]
      cbutton.text.destroy();
      cbutton.destroy();
      this.psigns[i] = null;
      this.playerReady[i] = null;
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
        if (cmd == commands.LOGOUT){
          let playerId = target.split(TARGET_DELIMETER)[2];
          this.removePlayer(playerId)
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

        console.log(this.playerReady);
        console.log(this.psigns);
        for(var i = 0; i < this.playerReady.length; i++){
          if(this.playerReady !== null){
            this.showReadyState(this.playerReady[i], this.psigns[i])
          }
        }
        this.allReadyState = this.allReady(this.playerReady);
        console.log('All ready:', this.allReadyState);
    }

    update () {
        if (this.roomId.length > 0) {
            let text = this.game.add.text(this.game.width / 3, 20, "Welcome to Room " + this.roomId);
        }
        if(this.indicator.hasFinished){
          this.startGame()
        }
    }
}
