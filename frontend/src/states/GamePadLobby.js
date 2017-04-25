
import Phaser from 'phaser'
import config from '../config'
import {commands, targets, payloads, DELIMETER, NONE, TARGET_DELIMETER} from '../commands'

export default class extends Phaser.State {
    init() {
        this.roomId = "";
        this.connected = false;
        this.connectedMessage = "";
        this.listofRooms = null;
        this.bmtextList = [];
        this.roomSelected = null;
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
          console.log("JSON typeof:", typeof payload);

          let obj = JSON.parse(payload);
          console.log("JSON input:", obj);
          console.log("JSON typeof:", typeof obj);

          this.listofRooms = obj
          this.showAvailableRooms();
        }
      }
      if (cmd === commands.LOGIN){
        if(payload === payloads.signup){
          this.state.start('GamePad', false, false, this.websocket, this.roomId);
        }
      }
    }

    sendRoomRequest() {
      let target = targets.MASTER + TARGET_DELIMETER + NONE + TARGET_DELIMETER + NONE;
      let msg = commands.REQUEST + DELIMETER + target + DELIMETER + payloads.LISTROOMS;
      this.websocket.send(msg);
    }

    showAvailableRooms(){
      let bmtext;
      let i = -1;
      let offset = 44;
      let x = this.game.world.centerX;
      let y;

      let rooms = this.listofRooms;
      for(let key1 in rooms){
        y = this.game.world.centerY + (offset*i);
        console.log("key =", key1);
        console.log('Adding text to:', x, y);
        bmtext = this.game.add.bitmapText(x, y, 'desyrel1', key1, offset);
        bmtext.anchor.setTo(0.5);
        bmtext.inputEnabled = true;
        bmtext.useHandCursor = true;
        bmtext.roomid = key1
        bmtext.events.onInputDown.add(this.setRoomid, this)

        this.bmtextList.push(bmtext);
        bmtext = null;
        i++;
      }
    }

    setRoomid(item){
      this.roomId = item.roomid;
      this.registerPad();
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

      this.state.start('GamePad',true , false, this.websocket, this.roomId);
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
