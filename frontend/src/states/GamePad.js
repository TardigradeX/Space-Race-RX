import Phaser from 'phaser'
import * as strings from "../commands";


export default class extends Phaser.State {
    init(websocket, roomId) {
        console.log("roomId "+ roomId);
        console.log("socket "+websocket);
        this.websocket = websocket;
        this.roomId = roomId;
    }

    preload() {
        // Log errors
       /* this.websocket.onerror = function (error) {
            console.log('WebSocket Error ' + error);
        };

        this.websocket.onmessage = function (message) {
            console.log("Message Incoming ... ")
            console.log(message.data);
        }*/

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
        let payload;

        if(this.leftDown && this.rightDown) {
            payload = strings.commands.THRUST;
         } else if(this.leftDown) {
            payload = strings.commands.LEFTROLL;
         } else if(this.rightDown) {
            payload = strings.commands.RIGHTROLL;
         }else {
            payload = strings.NONE;
         }

         let message = strings.commands.MESSAGE + strings.DELIMETER +
             strings.targets.MASTER + strings.TARGET_DELIMETER + this.roomId + strings.TARGET_DELIMETER + 1 + strings.DELIMETER
        + payload;

        console.log(" PAYLOAD IS : " + payload);
        console.log("REady state "  + this.websocket.readyState);
        this.websocket.send(message);
        console.log("REady state "  + this.websocket.readyState);
    }


}


