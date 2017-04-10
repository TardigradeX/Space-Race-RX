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
        this.buttonMaster = this.game.add.button(this.game.world.centerX - 95, 200, 'button', this.onMaster, this, 2, 1, 0);

        this.buttonController = this.game.add.button(this.game.world.centerX - 95, 400, 'button', this.onController, this, 2, 1, 0);
    }


    onMaster () {
        this.state.start('Lobby')
    }

    onController() {
        this.state.start('GamePadLobby')
    }

}
