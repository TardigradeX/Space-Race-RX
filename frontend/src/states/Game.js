/* globals __DEV__ */
import Phaser from 'phaser'
import SpaceShip from '../sprites/spaceship'
import SpaceShipFactory from "../sprites/SpaceShipFactory";

export default class extends Phaser.State {
  init () {
  }
  preload () {
      self = this

      this.websocket = new WebSocket("ws://localhost:9000/ws");

      // When the connection is open, send some data to the server
      this.websocket.onopen = function () {
          console.log("OPENED MASTER SOCKET");
      };

      // Log errors
      this.websocket.onerror = function (error) {
          console.log('WebSocket Error ' + error);
      };

      this.websocket.onmessage = function (message) {
          //console.log(message.data);
          if (message.data == "left_down")
              self.spaceShip.thrustLeftOn();
          else if (message.data == "left_up")
              self.spaceShip.thrustLeftOff();
          else if (message.data == "right_down")
              self.spaceShip.thrustRightOn();
          else if (message.data == "right_up")
              self.spaceShip.thrustRightOff();
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
  }

  render () {
    if (__DEV__) {
      this.game.debug.spriteInfo(this.spaceShip, 32, 32)
    }
  }

    update () {
      console.log(this.spaceShip.thrustLeft);
      console.log(this.spaceShip.thrustRight);
      console.log(".............................");

        if (this.spaceShip.thrustLeft && this.spaceShip.thrustRight) {
            this.game.physics.arcade.accelerationFromRotation(this.spaceShip.rotation - Math.PI / 2, 350, this.spaceShip.body.acceleration);
        }
        else if (this.spaceShip.thrustLeft && !this.spaceShip.thrustRight) {
            this.spaceShip.body.angularVelocity = -300;
            this.spaceShip.body.acceleration.set(0);
        }
        else if (this.spaceShip.thrustRight && !this.spaceShip.thrustLeft) {
            this.spaceShip.body.angularVelocity = 300;
            this.spaceShip.body.acceleration.set(0);
        }
        else {
                this.spaceShip.body.angularVelocity = 0;
                this.spaceShip.body.acceleration.set(0);
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
