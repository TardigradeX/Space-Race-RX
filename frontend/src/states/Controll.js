import Phaser from 'phaser'
import { centerGameObjects } from '../utils'

export default class extends Phaser.State {
    init() {
    }

    preload() {
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

        this.websocket.onclose = function(){
          console.log("Controller closed")
        }

        this.leftDown = false;
        this.rightDown = false;
    }

    create() {

        this.buttonBoostRight = this.game.add.button(300, this.game.world.centerY / 2, 'button', null, this, 0, 1, 0, 1);
        this.buttonBoostRight.events.onInputOver.add(function () {
            this.rightDown = true;
            this.controll()
        }, this);
        this.buttonBoostRight.events.onInputOut.add(function () {
            this.rightDown = false;
            this.controll()
        }, this);
        this.buttonBoostRight.events.onInputDown.add(function () {
            this.rightDown = true;
            this.controll()
        }, this);
        this.buttonBoostRight.events.onInputUp.add(function () {
            this.rightDown = false;
            this.controll()
        }, this);


        this.buttonBoostLeft = this.game.add.button(32, this.game.world.centerY / 2, 'button', null, this, 0, 1, 0, 1);
        this.buttonBoostLeft.events.onInputOver.add(function () {
            this.leftDown = true;
            this.controll()
        }, this);
        this.buttonBoostLeft.events.onInputOut.add(function () {
            this.leftDown = false;
            this.controll()
        }, this);
        this.buttonBoostLeft.events.onInputDown.add(function () {
            this.leftDown = true;
            this.controll()
        }, this);
        this.buttonBoostLeft.events.onInputUp.add(function () {
            this.leftDown = false;
            this.controll()
        }, this);

    }


    controll() {

        if(this.leftDown && this.rightDown) {
            console.log("thrust");
            this.websocket.send('thrust');
         } else if(this.leftDown) {
            this.websocket.send('left');
            console.log("left");
         } else if(this.rightDown) {
            this.websocket.send('right');
            console.log("right");
         }else {
            this.websocket.send('none');
            console.log("none");
         }


    }


}
