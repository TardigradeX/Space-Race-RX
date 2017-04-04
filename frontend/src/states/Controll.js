import Phaser from 'phaser'
import { centerGameObjects } from '../utils'

export default class extends Phaser.State {

    init () {}

    preload () {
        this.websocket = new WebSocket("ws://192.168.2.166:9000/ws");

        // When the connection is open, send some data to the server
        this.websocket.onopen = function () {
            console.log("OPENED SOCKET");
        };

        // Log errors
        this.websocket.onerror = function (error) {
            console.log('WebSocket Error ' + error);
        };

        this.websocket.onmessage = function (message) {
            console.log("Message Incoming ... ")
            console.log(message.data);
        }
    }

    create () {
        this.buttonBoostLeft = this.game.add.button(32, this.game.world.centerY/2, 'button', this.nothing, this, 2, 1, 0);
        this.buttonBoostRight = this.game.add.button(300, this.game.world.centerY/2, 'button', this.nothing, this, 2, 1, 0);


        this.buttonBoostLeft.onInputDown.add(this.onDownLeft, this);
        this.buttonBoostLeft.onInputUp.add(this.onUpLeft, this);

        this.buttonBoostRight.onInputDown.add(this.onDownRight, this);
        this.buttonBoostRight.onInputUp.add(this.onUpRight, this);

    }

    nothing() {

    }

    onDownLeft() {
        this.websocket.send('left_down');
    }

    onUpLeft() {
        this.websocket.send('left_up');
    }

    onDownRight() {
        this.websocket.send('right_down');
    }

    onUpRight() {
        this.websocket.send('right_up');
    }


}

