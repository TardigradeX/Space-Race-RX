import Phaser from 'phaser'
import config from '../config'
import {DELIMETER, targets, commands, NONE, NEW, TARGET_DELIMETER} from "../commands";
import {Player} from "../Player";

export default class extends Phaser.State {

    init () {
      this.players = [];
      this.roomId = "";
    }

    preload () {

      this.load.image('button', 'assets/images/small_button.png');
      this.websocket = new WebSocket(config.wsServerAddress);

      this.websocket.onopen = function () {
          console.log("OPENED SOCKET");
          var msg = commands.LOGIN + DELIMETER + targets.SERVER + TARGET_DELIMETER +
              NONE + TARGET_DELIMETER + NONE + DELIMETER + NONE;
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
        this.websocket.send("logout|server,none,none|byebye")
        this.state.start("DummyDecide")
      }.bind(this)
    }

    create () {
        this.buttonMaster = this.game.add.button(this.game.world.centerX - 95, 200, 'button', this.startGame, this, 2, 1, 0);
    }


    startGame() {
        this.state.start('Game', false, false, this.websocket, this.roomId, this.players);
    }


    parse(message){
        let mySplit = message.split(DELIMETER);
        if(mySplit.length == 3) {
            let cmd = mySplit[0];
            let target = mySplit[1];
            let payload = mySplit[2];
            if (cmd == 'message') {
                if (payload == 'signup') {
                    this.roomId = target.split(TARGET_DELIMETER)[1];
                } else if (payload == 'joined'){
                    let playerId = target.split(TARGET_DELIMETER)[2];
                    this.players.push(new Player(playerId));
                }
            }
        }
    }

    update () {
        if (this.roomId.length > 0) {
            let text = this.game.add.text(this.game.width / 2, 70, this.roomId);
        }

    }
}
