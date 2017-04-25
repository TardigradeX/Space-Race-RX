import Phaser from 'phaser'
import { centerGameObjects } from '../utils'
import {Player} from "../Player";

export default class extends Phaser.State {

    init () {}

    preload () {
        // this.loaderBg = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBg')
        // this.loaderBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBar')
        // centerGameObjects([this.loaderBg, this.loaderBar])

        // this.load.setPreloadSprite(this.loaderBar)
        //
        // load your assets
        //
        this.load.image('spaceship', 'assets/images/spaceship.png');
        this.load.image('button', 'assets/images/small_button.png');
    }

    create () {
       /* if(this.game.device.desktop) {
            this.onMaster();
        } else {
            this.onController();
        }*/

      let mastertext, controllertext,returntext;
      this.buttonMaster = this.game.add.button(this.game.world.centerX/2, this.game.world.centerY/4, 'button', this.onMaster, this, 2, 1, 0);
      this.buttonMaster.anchor.setTo(1.2,0.5);
      mastertext = this.game.add.bitmapText(this.buttonMaster.x, this.buttonMaster.y, 'desyrel1','Create room');
      mastertext.anchor.setTo(0, 0.5);
      this.buttonController = this.game.add.button(this.game.world.centerX/2, (2*this.game.world.centerY)/4, 'button', this.onController, this, 2, 1, 0);
      this.buttonController.anchor.setTo(1.2, 0.5);
      controllertext = this.game.add.bitmapText(this.buttonController.x, this.buttonController.y, 'desyrel1','Join room');
      controllertext.anchor.setTo(0, 0.5);

    }


    onMaster () {
        this.state.start('Lobby')
    }

    onController() {
        this.state.start('GamePadLobby')
    }

}
