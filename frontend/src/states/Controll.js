import Phaser from 'phaser'
import { centerGameObjects } from '../utils'

export default class extends Phaser.State {

    init () {}

    preload () {
        this.websocket = new WebSocket("ws://localhost:9000/ws");

        // When the connection is open, send some data to the server
        this.websocket.onopen = function () {
            console.log("OPENED SOCKET");
        };

        // Log errors
        this.websocket.onerror = function (error) {
            console.log('WebSocket Error ' + error);
        };
    }

    create () {
        this.buttonBoost = this.game.add.button(this.game.world.centerX - 95, 200, 'button', this.nothing, this, 2, 1, 0);

        this.buttonBoost.onInputDown.add(this.onDown, this);
        this.buttonBoost.onInputUp.add(this.onUp, this);

    }

    nothing() {

    }

    onDown() {
        this.websocket.send('down');
    }

    onUp() {
        this.websocket.send('up');
    }


}

