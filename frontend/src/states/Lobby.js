import Phaser from 'phaser'

export default class extends Phaser.State {

    init () {
      this.isConnected = false

    }

    preload () {

      this.load.image('button', 'assets/images/small_button.png');
      this.websocket = new WebSocket("ws://localhost:9000/ws");

      this.websocket.onopen = function () {
          console.log("OPENED SOCKET");
          this.send('Hi there')
      };

      this.websocket.onerror = function (error) {
          console.log('WebSocket Error: ' + error);
      };

      this.websocket.onmessage = function (message) {
          console.log("Message Incoming ... ")
          console.log(message.data);
          // this.parse(message.data); // make it via bind
      }

      this.websocket.onclose = function(close){
        this.send("logout|room|byebye")
      }
    }

    create () {
      var x,y, centerX;
        console.log(this.game);

        this.buttonConnect = this.game.add.button(this.game.world.centerX - 50, 100, 'button', this.switchConnection, this, 2, 1, 0);
        this.buttonMsg = this.game.add.button(this.game.world.centerX - 50, 200, 'button', this.aMessage, this, 2, 1, 0);

    }

    aMessage(){
      console.log("Sending message");
      this.websocket.send("message|player1|Hey bitch")
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

    switchConnection(){
      if(!this.isConnected){
        console.log('Sending login');
        if(this.websocket.readyState == 1){
          this.websocket.send("loginmaster|target|hi there")
          this.isConnected = true
        } else {
          console.log('Fail - Websocket state: ' + this.websocket.readyState);
        }
      } else {
        console.log('Closing WebSocket ');
        if(this.websocket.readyState != 3){
          this.websocket.close()
        } else {
          console.log("Websocket already closed");
        }
      }
    }
}
