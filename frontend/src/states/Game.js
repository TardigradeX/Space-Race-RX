/* globals __DEV__ */
import Phaser from 'phaser'
import SpaceShipFactory from "../sprites/SpaceShipFactory";
import {DELIMETER, TARGET_DELIMETER} from "../commands";

export default class extends Phaser.State {
  init (websocket, roomId, players) {
      this.websocket = websocket;
      this.roomId = roomId;
      this.players = players;
      for(let i = 0; i < players.length; i++) {
          console.log("PLAYer" + players[i]);
      }
  }

  preload () {
      // Log errors
      this.websocket.onerror = function (error) {
          console.log('WebSocket Error ' + error);
      };

      this.websocket.onmessage = function (message) {
          console.log(message.data);
          this.parse(message.data)
      }.bind(this);
  }

    parse(message) {
        let mySplit = message.split(DELIMETER);
        if (mySplit.length == 3) {
            let cmd = mySplit[0];
            let target = mySplit[1];
            let payload = mySplit[2];
            console.log(mySplit);
            if (cmd == 'message') {
                let playerId = target.split(TARGET_DELIMETER)[2]; //todo later go to correct player
                this.spaceShips[playerId].movement = payload;
            }
        }
    }

  create () {
    const bannerText = 'Xander s Test';
    let banner = this.add.text(this.world.centerX, this.game.height - 80, bannerText);
    banner.font = 'Bangers';
    banner.padding.set(10, 16);
    banner.fontSize = 40;
    banner.fill = '#0c83bf';
    banner.smoothed = false;
    banner.anchor.setTo(0.5);

    this.factory = new SpaceShipFactory({game:this.game});


    this.spaceShip = this.factory.getSpaceShip(this.world.centerX, this.world.centerY, 'spaceship');
    this.spaceShips = new Map();

      for(let i = 0; i < this.players.length; i++) {
          console.log("PLAYer" + this.players[i]);
          this.spaceShips.set(this.players[i].id(), this.factory.getSpaceShip(this.world.centerX, this.world.centerY, 'spaceship'));
      }
      console.log(this.spaceShips);
  }

  render () {
    if (__DEV__) {
      this.game.debug.spriteInfo(this.spaceShip, 32, 32)
    }
  }

    update () {
        for (let spaceShip of this.spaceShips.values()) {

          if (spaceShip.movement == 'thrust') {
              this.game.physics.arcade.accelerationFromRotation(spaceShip.rotation - Math.PI / 2, 800, spaceShip.body.acceleration);
          } else {
              spaceShip.body.acceleration.set(0);
          }

          if (spaceShip.movement == 'left') {
              spaceShip.body.angularVelocity = -300;
          }
          else if (spaceShip.movement == 'right') {
              spaceShip.body.angularVelocity = 300;
          } else {
              spaceShip.body.angularVelocity = 0;
          }
      }

    }


  worldBoaderCollide(sprite) {
      if (sprite.x <= 32)
      {
          this.worldCollision();
      }
      else if (sprite.x >= this.game.width-32)
      {
          this.worldCollision();
      }

      if (sprite.y <= 32)
      {
          this.worldCollision();
      }
      else if (sprite.y >= this.game.height - 32)
      {
          this.worldCollision();
      }
  }

    worldCollision() {
        //this.state.start('GameOver')
    }
}
