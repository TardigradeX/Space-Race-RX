import Phaser from 'phaser'
import { centerGameObjects } from '../utils'

export default class extends Phaser.State {

  init () {}

  preload () {
    this.loaderBg = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBg')
    this.loaderBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBar')
    centerGameObjects([this.loaderBg, this.loaderBar])

    this.load.setPreloadSprite(this.loaderBar)
    //
    // load your assets
    //
    this.load.image('spaceship', 'assets/images/spaceship.png');
  }

  create () {

   let self = this;

    this.websocket = new WebSocket("ws://localhost:9000/ws");

      // When the connection is open, send some data to the server
      this.websocket.onopen = function () {
          self.websocket.send('Ping'); // Send the message 'Ping' to the server
          console.log("OPENED SOCKET");
      };

      // Log errors
      this.websocket.onerror = function (error) {
          console.log('WebSocket Error ' + error);
      };

      // Log messages from the server
      this.websocket.onmessage = function (e) {
          console.log('Server: ' + e.data);
      };


      this.websocket.onmessage = function (event) {
      console.log(event.data);
      };
  }
}
