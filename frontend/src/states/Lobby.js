import Phaser from 'phaser'
import * from "../commands";

export default class extends Phaser.State {

    init () {
      this.isConnected = false

    }

    preload () {

      this.load.image('button', 'assets/images/small_button.png');
      this.websocket = new WebSocket("ws://localhost:9000/ws");

      this.websocket.onopen = function () {
          console.log("OPENED SOCKET");
          this.send(LOGINMASTER + DELIMETER + SERVER + DELIMETER + NONE)
      };

      this.websocket.onerror = function (error) {
          console.log('WebSocket Error: ' + error);
      };

      this.websocket.onmessage = function (message) {
          console.log("Message Incoming ... ")
          console.log(message.data);
      };

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
          console.log('Player1 signed up. ' + message);
        }
      }
    }
}
