import Phaser from 'phaser'
import config from '../config'
import {commands, targets, DELIMETER, NONE, TARGET_DELIMETER} from '../commands'

export default class extends Phaser.State {
    init() {
        this.roomId = "";
        this.connected = false;
        this.connectedMessage = "";
    }

    preload() {
        this.websocket = new WebSocket(config.wsServerAddress);

        // When the connection is open, send some data to the server
        this.websocket.onopen = function () {
            console.log("OPENED SOCKET");
            this.connected = true;
        }.bind(this);

        // Log errors
        this.websocket.onerror = function (error) {
            console.log('WebSocket Error ' + error);
        };

        // Log errors
        this.websocket.onclose = function () {
            console.log('WebSocket Closed, Should not happen ');
        };

        this.websocket.onmessage = function (message) {
            this.state.start('GamePad', false, false, this.websocket, this.roomId);
        }.bind(this);
    }

    create() {
        let input = document.createElement("input");input.type = "number";input.style.cssText = "position:absolute; left:-1px; top: -1px; width:1px; height:1px; opacity:0";document.body.appendChild(input);
        input.focus();
        this.game.input.keyboard.onDownCallback = function() {
            this.keyPress(this.game.input.keyboard.event.keyCode)
        }.bind(this);

        this.sendRoomId = this.game.add.button(0, 0, 'button', null, this, 0, 1, 0, 1);
        this.sendRoomId.events.onInputDown.add(function () {
            this.registerPad();
        }, this);

    }


    keyPress(keyCode) {

        if(keyCode == Phaser.KeyCode.ENTER) {
            this.registerPad();
        } else if(keyCode == Phaser.KeyCode.BACKSPACE) {
            this.roomId = this.roomId.slice(0,-1);
        }
        else {
            this.roomId += String.fromCharCode(keyCode);
        }


    }

    registerPad() {
        this.websocket.send(
            commands.LOGIN + DELIMETER +
            targets.SERVER + TARGET_DELIMETER + this.roomId + DELIMETER +
            NONE
        );
    }

    update() {
        if(typeof this.text !== typeof undefined) {
            this.text.destroy();
        }
        if(this.roomId.length > 0) {
            this.text = this.game.add.text(this.game.width / 2, this.game.height / 2 , this.roomId);
        }

        if(this.connectedMessage.length > 0) {
            let message = this.game.add.text(this.game.width / 2, this.game.height / 3 , this.connectedMessage);
        }

    }


}


