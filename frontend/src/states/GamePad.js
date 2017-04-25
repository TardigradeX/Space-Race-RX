import Phaser from 'phaser'
import * as strings from "../commands";


export default class extends Phaser.State {


    constructor() {
        super();
        window.addEventListener("resize", function(event) {
            if(this.game != null) {
                const docElement = document.documentElement;
                this.game.width = docElement.clientWidth;
                this.game.height = docElement.clientHeight;
                this.buttonBoostRight.centerX = this.game.world.centerX;
                this.buttonBoostRight.centerY = this.game.world.centerY;
                this.buttonBoostRight.anchor.setTo(0.6);

                this.buttonBoostLeft.centerX = this.game.world.centerX;
                this.buttonBoostLeft.centerY = this.game.world.centerY;
                this.buttonBoostLeft.anchor.setTo(0.5);

                this.game.renderer.resize(this.game.width,this.game.height);
                console.log("RESIZED");
            }
        }.bind(this));
    }

    init(websocket, roomId) {
        this.websocket = websocket;
        this.roomId = roomId;
    }

    preload() {
        // Log errors
        this.websocket.onerror = function (error) {
            console.log('WebSocket Error ' + error);
        };


        this.websocket.onclose = function(){
          console.log("Controller closed")
          target = targets.MASTER + TARGET_DELIMETER + NONE + TARGET_DELIMETER + NONE
          msg = commands.LOGOUT + DELIMETER + target + DELIMETER + NONE
          this.send(msg);

        }

        this.leftDown = false;
        this.rightDown = false;
    }

    create() {

        this.buttonBoostRight = this.game.add.button(this.game.world.centerX, this.game.world.centerY, 'button', null, this, 0, 1, 0, 1);
        this.buttonBoostRight.anchor.setTo(0.5, 0.5);
        this.buttonBoostRight.scale.setTo(1.8, 1.8);
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


        this.buttonBoostLeft = this.game.add.button(this.game.world.centerX, this.game.world.centerY, 'button', null, this, 0, 1, 0, 1);
        this.buttonBoostLeft.anchor.setTo(-0.5, 0.5);
        this.buttonBoostLeft.scale.setTo(1.8, 1.8);
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
            payload = strings.commands.RIGHTROLL;
         } else if(this.rightDown) {
            payload = strings.commands.LEFTROLL;
         }else {
            payload = strings.commands.NONE;
         }

        let cmd = payload

        let target = strings.targets.MASTER + strings.TARGET_DELIMETER +
                    this.roomId + strings.TARGET_DELIMETER + strings.NONE;
        let message = cmd + strings.DELIMETER + target + strings.DELIMETER + payload;
        this.websocket.send(message);
    }

}
