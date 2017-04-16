/* globals __DEV__ */
import Phaser from 'phaser'
import SpaceShipFactory from "../sprites/SpaceShipFactory";
import {commands, DELIMETER, TARGET_DELIMETER} from "../commands";
import {getFinishFromMap, getStartFromMap} from '../tileMapUtils';
import Finish from '../sprites/finish'

export default class extends Phaser.State {
<<<<<<< HEAD
    init(websocket, roomId, players) {
        this.websocket = websocket;
        this.roomId = roomId;
        this.players = players;
    }

    preload() {
        this.game.load.tilemap('level1', 'assets/maps/space_race_level1.json', null, Phaser.Tilemap.TILED_JSON);

        this.game.load.image('gameTiles', 'assets/maps/tile_set.png');
        this.load.image('spaceship', 'assets/images/spaceship.png');
        this.load.image('finish', 'assets/images/finish.png');

        // Log errors
        this.websocket.onerror = function (error) {
            console.log('WebSocket Error ' + error);
        };

        this.websocket.onmessage = function (message) {
            this.parse(message.data)
        }.bind(this);
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
=======
  init (websocket, roomId, players) {
      this.websocket = websocket;
      this.roomId = roomId;
      this.players = players;

      this.emitter;

  }

  preload () {
      this.load.image('explosion','./assets/sprites/enemy-bullet.png');

      // Log errors
      this.websocket.onerror = function (error) {
          console.log('WebSocket Error ' + error);
      };

      this.websocket.onmessage = function (message) {
          console.log("<<", message.data);
          this.parse(message.data)
      }.bind(this);

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
          if (cmd == commands.LEFTROLL){
            let playerId = target.split(TARGET_DELIMETER)[2];
            this.spaceShips.get(playerId).movement = cmd;
          }
          if (cmd == commands.RIGHTROLL){
            let playerId = target.split(TARGET_DELIMETER)[2];
            this.spaceShips.get(playerId).movement = cmd;
          }
          if (cmd == commands.THRUST){
            let playerId = target.split(TARGET_DELIMETER)[2];
            this.spaceShips.get(playerId).movement = cmd;
          }
          if (cmd == commands.NONE){
            let playerId = target.split(TARGET_DELIMETER)[2];
            this.spaceShips.get(playerId).movement = cmd;
          }
          if (cmd == commands.LOGOUT){
            let playerId = target.split(TARGET_DELIMETER)[2];
            this.removeSpaceShip(this.spaceShips, playerId);
          }
>>>>>>> ui_prototypes

      }
    }

<<<<<<< HEAD
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

        for (let i = 0; i < this.players.length; i++) {
            this.spaceShips.set(this.players[i].id, this.factory.getSpaceShip(startPosition.x, startPosition.y, 'spaceship'));
        }
    }

    update() {
        for (let [id, spaceShip] of this.spaceShips.entries()) {
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
            this.game.physics.arcade.collide(spaceShip, this.foreground);

            this.hasFinished(spaceShip, id);
        }
=======
  create () {


    let scalefact = 1
    let offset = 100;

    this.factory = new SpaceShipFactory({game:this.game});
    this.spaceShips = new Map();

      for(let i = 0; i < this.players.length; i++) {
          this.spaceShips.set(this.players[i].id, this.factory.getSpaceShip(this.world.centerX + (offset * (i - 2)), this.world.centerY, 'spaceship'));
          this.spaceShips.get(this.players[i].id).scale.setTo(scalefact,scalefact);
      }

  }


  // createEmitter(){
  //   let emitter = this.game.add.emitter(100,100,100);
  //
  //   emitter.scale.setTo(4,4);
  //   emitter.lifespan = 2000;
  //
  //   emitter.gravity = 1;
  //   emitter.lifespan = 2000;
  //   emitter.minRotation = 0;
  //   // this.emitter.setAlpha(0.1, 0.1);
  //   emitter.maxRotation = 0;
  //   emitter.maxParticleSpeed=1;
  //   emitter.makeParticles('explosion');
  //
  //   return(emitter);
  // }

  update () {
        for (let spaceShip of this.spaceShips.values()) {

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
>>>>>>> ui_prototypes

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
