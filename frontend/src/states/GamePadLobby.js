import Phaser from 'phaser'
import config from '../config'
import {commands, targets, payloads, DELIMETER, NONE, TARGET_DELIMETER} from '../commands'

export default class extends Phaser.State {
    init() {
        this.roomId = "";
        this.connected = false;
        this.connectedMessage = "";
        this.listofRooms = null;
    }

    preload() {
        this.websocket = new WebSocket(config.wsServerAddress);

        // When the connection is open, send some data to the server
        this.websocket.onopen = function () {
            console.log("OPENED SOCKET");
            this.connected = true;
            this.sendRoomRequest();
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
          console.log(message.data);
          this.parseMessage(message.data);
        }.bind(this);

        this.websocket.onclose = function(close){
          console.log(close);
          this.state.start("DummyDecide")
        }.bind(this)
    }

    create() {
        let input = document.createElement("input");input.type = "number";input.style.cssText = "position:absolute; left:-1px; top: -1px; width:1px; height:1px; opacity:0";document.body.appendChild(input);
        input.focus();
        this.game.input.keyboard.onDownCallback = function() {
            this.keyPress(this.game.input.keyboard.event.keyCode)
        }.bind(this);
    }

    parseMessage(message){

      console.log(message);
      let mySplit = message.split(DELIMETER);

      if (mySplit.length != 3){
        console.log("Not a command, ignore");
        return(NONE)
      }

      let cmd = mySplit[0];
      let target = mySplit[1];
      let payload = mySplit[2];

      console.log("Command:", cmd);
      if (cmd === commands.ANSWER){
        if(payload.startsWith(payloads.LISTROOMS)){
          payload = payload.replace(payloads.LISTROOMS + TARGET_DELIMETER, '')
          console.log("payload input:", payload);
          console.log("payload typeof:", typeof payload);

          let obj = JSON.parse(payload);
          console.log("JSON input:", obj);
          console.log("JSON typeof:", typeof obj);

          this.listofRooms = obj
          this.showAvailableRooms();
        }
      }

      this.state.start('GamePad', false, false, this.websocket, this.roomId);
    }

    sendRoomRequest() {
      let target = targets.MASTER + TARGET_DELIMETER + NONE + TARGET_DELIMETER + NONE;
      let msg = commands.REQUEST + DELIMETER + target + DELIMETER + payloads.LISTROOMS;
      this.websocket.send(msg);
    }

    showAvailableRooms(){
      let bmtext;
      let i = 0;
      let x = 10;
      let y = 40;
      let offset = 15;

      let rooms = this.listofRooms;
      console.log(rooms);
      for(var key in rooms){
          if (rooms.hasOwnProperty(key)){
              var value=rooms[key];
              // work with key and value
              console.log(value);
          }
      }
      /**
      for(let key1 in rooms){
        console.log("key =", key1);
        // bmtext = this.game.add.bitmapText(x, y + (offset*i), 'stupid_font', key1, offset - 3)
        i++;
      }
      **/
      console.log("i =",i);
    }

    keyPress(keyCode) {
        if (keyCode == Phaser.KeyCode.ENTER) {
            this.registerPad();
        } else if(keyCode == Phaser.KeyCode.BACKSPACE) {
            this.roomId = this.roomId.slice(0,-1);
        } else {
            this.roomId += String.fromCharCode(keyCode);
        }
    }

    registerPad() {
      var msg = commands.LOGIN + DELIMETER +
      targets.SERVER + TARGET_DELIMETER + this.roomId + TARGET_DELIMETER + NONE + DELIMETER +
      NONE
      this.websocket.send(msg);
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
