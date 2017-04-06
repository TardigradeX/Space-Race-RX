import Phaser from 'phaser'
import config from '../config'
import {DELIMETER, targets, commands, NONE} from "../commands";

export default class extends Phaser.State {

    init () {
      this.playerCount = 0;
      this.roomId = "";
    }

    preload () {

      this.load.image('button', 'assets/images/small_button.png');
      this.websocket = new WebSocket(config.wsServerAddress);

      this.websocket.onopen = function () {
          console.log("OPENED SOCKET");
          this.send(commands.LOGINMASTER + DELIMETER + targets.SERVER + DELIMETER + NONE)
      };

      this.websocket.onerror = function (error) {
          console.log('WebSocket Error: ' + error);
      };

      this.websocket.onmessage = function (message) {
          console.log("Message Incoming ... ")
          console.log(message.data);
          this.roomId = message.data;
      }.bind(this);

      this.websocket.onclose = function(close){
        this.send("logout|room|byebye")
      }
    }

    create () {

    }


    parse(message){
      console.log(typeof message);
      var myRe = '.+|.+|.+'
      var n = message.search(myRe)
      console.log("mysplit: " + n);
      if (n == 1){
        mySplit = message.split('|')
        cmd = mySplit[0]
        target = mySplit[1]
        payload = mySplit[2]
        if (cmd == 'signup'){
          console.log('Player signed up. ' + message);
          this.playerCount ++;
        }
      }
    }

    update (){
        if(this.roomId.length > 0) {
            let text= this.game.add.text(this.game.width / 2, (this.game.height / 5 ) * 4, this.roomId);
            text.anchor.x = 0.5;
            text.anchor.y = 0.2;
        }

        if(this.playerCount > 0) {
            let style = { font: "20px Courier", fill: "#fff", tabs: 132 };
            let players = "";
            for(let i = 0; i < this.playerCount; i++) {
                players += "Player "+i+"\t";
            }
            this.game.add.text(100, 64, players.slice(0,-1), style);
        }

    }
}
