import Phaser from 'phaser'
import config from '../config'
import {DELIMETER, targets, commands, payloads, NONE, NEW, TARGET_DELIMETER} from "../commands";
import {Player} from "../Player";

export default class extends Phaser.State {

    init () {
      this.xbutton = 20;
      this.ybutton = 120;
      this.yoffset = 60;
      this.pbuttons = [];
      this.pReady = [];

      this.players = [];
      this.playerReady = [];
      this.roomId = "";
    }

    preload () {

      this.load.spritesheet('readyState', 'assets/images/sign-lobby_spriteSheet.png' ,64,64, 2);
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
  //     var mummy = game.add.sprite(300, 200, 'mummy');
   //
  //  //  Here we add a new animation called 'walk'
  //  //  Because we didn't give any other parameters it's going to make an animation from all available frames in the 'mummy' sprite sheet
  //  var walk = mummy.animations.add('walk');
   //
  //  //  And this starts the animation playing by using its key ("walk")
  //  //  30 is the frame rate (30fps)
  //  //  true means it will loop when it finishes
  //  mummy.animations.play('walk', 30, true);
      this.readyState = this.game.add.sprite(300, 400,'readyState');
      // readyState.inputEnabled=true;
      // readyState.events.onInputDown.add(this.readyStateListener,this);

      this.buttonMaster = this.game.add.button(this.game.world.centerX - 95, 120, 'button', this.startGame, this, 2, 1, 0);

    }

    checkReady(playerStates){
      if(playerStates.length === 0){
        this.readyState.frame = 0;
        return(0)
      }

      var n = playerStates.reduce(function(pv, cv) { return pv + cv; }, 0);
      if (n === playerStates.length){
          this.readyState.frame = 1;
      } else {
          this.readyState.frame = 0;
      }
      return(this.readyState.frame)
    }

    startGame() {
      console.log("Master button pushed");
        this.state.start('Game', false, false, this.websocket, this.roomId, this.players);
    }

    addPlayer(playerId){
      var i, k;
      i = this.pbuttons.findIndex(function(player){return(player === 0);})
      if(i === -1){ i = this.pbuttons.length }
      k = i + 1

      var x, y, offset, pbutton, text1;
      this.players.push(new Player(playerId));
      this.playerReady.push(0);
      x = this.xbutton;
      y = this.ybutton;
      offset = this.yoffset;

      pbutton = this.game.add.button(x, y + (offset*k), 'button');
      text1 = this.game.add.text(x + 40, y + (offset*k), "Player"+ (k));
      pbutton.text = text1

      if (k == this.pbuttons.length){
        this.pbuttons.push(pbutton)
      } else {
        this.pbuttons[i] = pbutton
      }
    }

    removePlayer(playerId){
      var i = parseInt(playerId) - 1

      if( this.pbuttons[i] === 0){
        return(NONE);
      }
      let cbutton = this.pbuttons[i]
      cbutton.text.destroy();
      cbutton.destroy();
      this.pbuttons[i] = 0;

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

        this.allReady = this.checkReady(this.playerReady);
        console.log('All ready:', this.allReady);
    }

    update () {
        if (this.roomId.length > 0) {
            let text = this.game.add.text(this.game.width / 3, 20, "Welcome to Room " + this.roomId);
        }
    }
}
