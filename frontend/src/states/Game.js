/* globals __DEV__ */
import Phaser from 'phaser'
import SpaceShipFactory from "../sprites/SpaceShipFactory";
import {commands, DELIMETER, TARGET_DELIMETER} from "../commands";
import {getFinishFromMap, getStartFromMap} from '../tileMapUtils';
import Finish from '../sprites/finish';

export default class extends Phaser.State {

    init(websocket, roomId, players) {
        this.websocket = websocket;
        this.roomId = roomId;
        this.players = players;

        this.controllerActive = false;

        this.gametimer;
        this.countdownEvent;
        this.startTime;
        this.timeview;
    }

    startGame(){
      this.gametimer.stop();
      this.controllerActive = true;
      this.gametimer.destroy();

      console.log('Restarting timer');
      this.gametimer = this.game.time.create();
      this.gametimer.start();
      console.log("Timer is running:", this.gametimer.running);
    }

    preload() {
        this.load.image('explosion','./assets/sprites/enemy-bullet.png');

        this.game.load.tilemap('level1', 'assets/maps/space_race_level1.json', null, Phaser.Tilemap.TILED_JSON);

        this.game.load.image('gameTiles', 'assets/maps/tile_set.png');
        this.load.image('spaceship', 'assets/images/spaceship.png');
        this.load.image('finish', 'assets/images/finish.png');


        // // Log errors
        // this.websocket.onerror = function (error) {
        //     console.log('WebSocket Error ' + error);
        // };
        //
        // this.websocket.onmessage = function (message) {
        //     this.parse(message.data)
        // }.bind(this);
    }

    create() {
        this.map = this.game.add.tilemap('level1');

        this.map.addTilesetImage('MY_TILES', 'gameTiles');

        //create layer
        this.backgroundlayer = this.map.createLayer('background');
        this.foreground = this.map.createLayer('foreground');

        //collision on blockedLayer
        this.map.setCollisionBetween(1, 100000, true, 'foreground');

        //resizes the game world to match the layer dimensions
        this.backgroundlayer.resizeWorld();

        let offset = 100;
        this.factory = new SpaceShipFactory({game: this.game});
        this.spaceShips = new Map();


        let startPosition =  getStartFromMap(this.map);
        this.finishPosition = getFinishFromMap(this.map);

        let finish = new Finish({
            game: this.game,
            x: this.finishPosition.x,
            y: this.finishPosition.y,
            asset: 'finish'
        });

        this.game.add.existing(finish);
        this.spaceShips.set("1", this.factory.getSpaceShip(startPosition.x, startPosition.y, 'spaceship'));

        // for (let i = 0; i < this.players.length; i++) {
        //     this.spaceShips.set(this.players[i].id, this.factory.getSpaceShip(startPosition.x, startPosition.y, 'spaceship'));
        // }

        this.gametimer = this.game.time.create();
        this.countdownEvent = this.gametimer.add(Phaser.Timer.SECOND * 3, this.startGame, this);
        this.gametimer.start();

        this.timeview = this.game.add.bitmapText(this.game.world.centerX,(1*this.game.world.centerY/5),'desyrel1', this.formatTime(Math.round(this.gametimer.ms / 1000), 32));
        this.timeview.anchor.setTo(0.5,0);
    }

    update() {
        for (let [id, spaceShip] of this.spaceShips.entries()) {
          if(this.controllerActive){
              if (spaceShip.movement == 'thrust') {
                  this.game.physics.arcade.accelerationFromRotation(spaceShip.rotation - Math.PI / 2, 800, spaceShip.body.acceleration);
              } else {
                  spaceShip.body.acceleration.set(0);
              }

              if (spaceShip.movement == 'left') {
                  spaceShip.body.angularVelocity = -300;
              }
              else if (spaceShip.movement == 'right') {
                  spaceShip.body.angularVelocity = 300;
              } else {
                  spaceShip.body.angularVelocity = 0;
              }
            }
            this.game.physics.arcade.collide(spaceShip, this.foreground);

            this.hasFinished(spaceShip, id);
        }
    }

    render(){
      this.viewtime();
    }

    viewtime(){
      let s1, t1;
      t1 = this.controllerActive ? this.gametimer.ms : this.countdownEvent.delay - this.gametimer.ms
      if(t1 < 0){
        let tmp = this.game.add.bitmapText(this.game.world.centerX, this.game.world.centerY, 'desyrel1', 'GO', 256);
        tmp.anchor.setTo(0.5);
        game.time.events.add(500, function(){tmp.destroy()}, this);
      }
      s1 = this.formatTime(Math.round(t1/1000));
      this.timeview.text = s1;
    }

    formatTime(s) {
      if(s < 0){
        return("00:00")
      }
      // Convert seconds (s) to a nicely formatted and padded time string
      var minutes = "0" + Math.floor(s / 60);
      var seconds = "0" + (s - minutes * 60);
      return minutes.substr(-2) + ":" + seconds.substr(-2);
    }

    parse(message) {
        let mySplit = message.split(DELIMETER);
        if (mySplit.length == 3) {
            let cmd = mySplit[0];
            let target = mySplit[1];
            let payload = mySplit[2];
            if (cmd == 'message') {
                let playerId = target.split(TARGET_DELIMETER)[2];
                this.spaceShips.get(playerId).movement = payload;
            }
            if (cmd == commands.LEFTROLL) {
                let playerId = target.split(TARGET_DELIMETER)[2];
                this.spaceShips.get(playerId).movement = cmd;
            }
            if (cmd == commands.RIGHTROLL) {
                let playerId = target.split(TARGET_DELIMETER)[2];
                this.spaceShips.get(playerId).movement = cmd;
            }
            if (cmd == commands.THRUST) {
                let playerId = target.split(TARGET_DELIMETER)[2];
                this.spaceShips.get(playerId).movement = cmd;
            }
            if (cmd == commands.NONE) {
                let playerId = target.split(TARGET_DELIMETER)[2];
                this.spaceShips.get(playerId).movement = cmd;
            }
            if (cmd == commands.LOGOUT) {
                let playerId = target.split(TARGET_DELIMETER)[2];
                this.removeSpaceShip(this.spaceShips, playerId);
            }
      }
    }

    removeSpaceShip(item, playerId){
      console.log('Deleting ship of player',playerId);
      /**
      [BUG]
      removal incomplete, ship does not vanish on logout
      destroy the object within the map?
      **/
      item.get(playerId).explode();
      // item.get(playerId).destroy();
      // item.delete(playerId);
    }

    hasFinished(sprite, id) {
        if (Math.abs(sprite.x - this.finishPosition.x) < 32 &&
            Math.abs(sprite.y - this.finishPosition.y) < 32) {
            this.playerFinished(id);
        }
    }

    playerFinished(id) {
        this.state.start('GameFinished', true, false, id);
    }
}
