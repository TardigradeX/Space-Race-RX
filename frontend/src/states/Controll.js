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

        this.called = 0;
        this.leftDown = false;
        this.rightDown = false;
    }

    create () {
        this.game.input.addPointer();
        this.game.input.addPointer();

        // This one registers a mouse click handler that will be called
        this.game.input.maxPointers = 2;
        this.game.input.touch.onTouchEnter(this.testPointer, this);
        this.game.input.touch.onTouchLeave(this.testPointer, this);
    }



    nothing() {

    }


    testPointer(event) {
         this.called++;
         this.leftDown = false;
         this.rightDown = false;

         for(var pointer of this.game.input.pointers){
             console.log(pointer.active);
           if(pointer.active && pointer.clientX < 100 && pointer.clientX > 0) {
               this.leftDown = true;
           }
           if(!pointer.active && pointer.clientX < 100 && pointer.clientX > 0) {
                 this.leftDown = false;
           }
        }

        console.log("________________________");

        /*if(this.leftDown && this.rightDown) {
            this.websocket.send('thrust');
        } else if(this.leftDown && !this.rightDown) {
            this.websocket.send('left');
        } else if(!this.leftDown && this.rightDown) {
            this.websocket.send('right');
        }else if(!this.leftDown && !this.rightDown){
            this.websocket.send('none');
        }*/

    }


    render() {
        this.game.debug.pointer(this.game.input.pointer1);
        this.game.debug.pointer(this.game.input.pointer2);

        this.game.debug.text("PointersSize:" + this.game.input.pointers.length, 0,  20);
        this.game.debug.text("LEFT:" + this.leftDown, 0,  60);
        this.game.debug.text("RIGHT:" + this.rightDown, 0,  80);
        this.game.debug.text("CALLED_Upper:" + this.called, 0,  100);

        if(this.leftDown && this.rightDown) {
            this.game.debug.text("cmd:thrust", 0,  120);
        } else if(this.leftDown && !this.rightDown) {
            this.game.debug.text("cmd: left", 0,  120);
        } else if(!this.leftDown && this.rightDown) {
            this.game.debug.text("cmd:right", 0,  120);
        }else if(!this.leftDown && !this.rightDown){
            this.game.debug.text("cmd:none", 0,  120);
        }
    }


}

