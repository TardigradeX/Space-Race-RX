/* globals __DEV__ */
import Phaser from 'phaser'
import SpaceShipFactory from "../sprites/SpaceShipFactory";
import {commands, DELIMETER, TARGET_DELIMETER} from "../commands";

export default class extends Phaser.State {
    init(websocket, roomId, players) {
        this.websocket = websocket;
        this.roomId = roomId;
        this.players = players;
    }

    preload() {
        this.game.load.tilemap('level1', 'assets/maps/space_race_level1.json', null, Phaser.Tilemap.TILED_JSON);

        this.game.load.image('gameTiles', 'assets/maps/tile_set.png');

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

        for (let i = 0; i < this.players.length; i++) {
            this.spaceShips.set(this.players[i].id, this.factory.getSpaceShip(this.world.centerX + (offset * (i - 2)), this.world.centerY, 'spaceship'));
        }
    }

    update() {
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
            this.game.physics.arcade.collide(spaceShip, this.foreground);
        }

    }

    removeSpaceShip(item, playerId) {
        console.log('Deleting ship of player', playerId);
        /**
         [BUG]
         removal incomplete, ship does not vanish on logout
         destroy the object within the map?
         **/
        item.delete(playerId)
    }

    worldBoaderCollide(sprite) {
        if (sprite.x <= 32) {
            this.worldCollision();
        }
        else if (sprite.x >= this.game.width - 32) {
            this.worldCollision();
        }

        if (sprite.y <= 32) {
            this.worldCollision();
        }
        else if (sprite.y >= this.game.height - 32) {
            this.worldCollision();
        }
    }

    worldCollision() {
        //this.state.start('GameOver')
    }
}
