/* globals __DEV__ */
import Phaser from 'phaser'
import SpaceShipFactory from "../sprites/SpaceShipFactory";
import {commands, DELIMETER, TARGET_DELIMETER, playerStates, colors} from "../commands";
import {getFinishFromMap, getStartFromMap} from '../tileMapUtils';
import Finish from '../sprites/finish';
import BitmapTimer from '../sprites/BitmapTimer';
import BitmapStats from '../sprites/BitmapStats';

export default class extends Phaser.State {

    init(websocket, roomId, players) {
        this.websocket = websocket;
        this.roomId = roomId;
        this.players = players;

        this.controllerActive = false;
        this.gameFinished = false;

        this.gametimer;
        this.countdownEvent;
        this.startTime;
        this.timeview;
    }

    startGame() {
        this.controllerActive = true;
        this.gametimer.visible = false;
        this.gametimer.reset(true);
        let tmp = this.game.add.bitmapText(this.game.world.centerX, this.game.world.centerY, 'desyrel1', "GO", 256);
        tmp.anchor.set(0.5);
        this.game.time.events.add(1000, function () {
            tmp.destroy();
            this.gametimer.visible = true;
            this.gametimer.start();
        }, this);
    }

    preload() {
        this.game.load.audio('explosion', './assets/audio/explosion.mp3');
        this.load.image('explosion', './assets/sprites/enemy-bullet.png');

        this.game.load.tilemap('level1', 'assets/maps/space_race_level1.json', null, Phaser.Tilemap.TILED_JSON);

        this.game.load.image('gameTiles', 'assets/maps/tile_set.png');
        this.load.image('spaceship', 'assets/images/spaceship.png');
        this.load.image('finish', 'assets/images/finish.png');


        // // Log errors
        this.websocket.onerror = function (error) {
            console.log('WebSocket Error ' + error);
        };

        this.websocket.onmessage = function (message) {
            this.parse(message.data)
        }.bind(this);
    }

    create() {
        this.explosion = this.game.add.audio('explosion');
        this.game.sound.setDecodedCallback([this.explosion], this.start, this);
        this.map = this.game.add.tilemap('level1');

        this.map.addTilesetImage('MY_TILES', 'gameTiles');

        //create layer
        this.backgroundlayer = this.map.createLayer('background');
        this.foreground = this.map.createLayer('foreground');

        this.map.setCollisionBetween(1, 1000, true, 'foreground');

        //resizes the game world to match the layer dimensions
        this.backgroundlayer.resizeWorld();

        let offset = 100;
        this.factory = new SpaceShipFactory({game: this.game});
        this.spaceShips = new Map();


        this.startPosition = getStartFromMap(this.map);
        this.finishPosition = getFinishFromMap(this.map);

        let finish = new Finish({
            game: this.game,
            x: this.finishPosition.x,
            y: this.finishPosition.y,
            asset: 'finish'
        });

        this.game.add.existing(finish);

        // For Debugging Maps
        // this.spaceShips.set("1", this.factory.getSpaceShip(this.startPosition.x, this.startPosition.y, 'spaceship'));

        for (let i = 0; i < this.players.length; i++) {
            let ship = this.factory.getSpaceShip(this.startPosition.x + ((i - 2) * 32), this.startPosition.y, 'spaceship');
            ship.tint = colors[i];
            this.spaceShips.set(this.players[i].id, ship);
            this.spaceShips.get(this.players[i].id).time = '00:00:00';
        }


        this.stats = new BitmapStats({game: this.game, name: 'statsgroup', x: 2, y: 14, font: 'desyrel1', size: 32});
        // for(let i = 0; i < 4; i++){
        //   this.stats.recordTime('Player' + (i + 1), (i * 1000) + 3);
        // }
        // this.stats.viewTimes();

        this.gametimer = new BitmapTimer({
            game: this.game,
            x: this.game.world.centerX,
            y: 40,
            font: 'desyrel1',
            size: 64
        });
        this.gametimer.anchor.setTo(0.5, 0);
        this.game.add.existing(this.gametimer);
        this.gametimer.countdown(Phaser.Timer.SECOND * 3, this.startGame, this);
        this.gametimer.start();
    }

    start() {
       console.log("Sound Ready")
    }

    resetShip(spaceShip, x, y) {
        console.log("Reset Ship");
        spaceShip.repair();
        spaceShip.rotation = 0;
        spaceShip.x = x;
        spaceShip.y = y;
    }


    update() {
        for (let [id, spaceShip] of this.spaceShips.entries()) {
            if (spaceShip.playerState == playerStates.ALIVE) {
                if (spaceShip.movement == 'thrust') {
                    this.game.physics.arcade.accelerationFromRotation(spaceShip.rotation - Math.PI / 2, 800, spaceShip.body.acceleration);
                } else {
                    spaceShip.body.acceleration.set(0);
                }

                if (spaceShip.movement == 'left') {
                    spaceShip.body.angularVelocity = 300;
                }
                else if (spaceShip.movement == 'right') {
                    spaceShip.body.angularVelocity = -300;
                } else {
                    spaceShip.body.angularVelocity = 0;
                }
                if (this.game.physics.arcade.collide(spaceShip, this.foreground)) {
                    this.explodeAndWaitForReset(spaceShip);
                }

                this.hasFinished(spaceShip, id);
            }
            if (this.gameFinished) {
                this.stats.viewTimes();
            }
        }
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


    explodeAndWaitForReset(spaceShip) {
        spaceShip.explode();
        this.explosion.play();
        this.game.time.events.add(
            3000,
            function () {
                this.resetShip(spaceShip, this.startPosition.x, this.startPosition.y)
            },
            this
        );
    }

        removeSpaceShip(item, playerId) {
            console.log('Deleting ship of player', playerId);
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
            let ms1 = this.gametimer.timer.ms
            this.spaceShips.get(id).time = ms1;
            console.log("Time:" + this.spaceShips.get(id).time);
            this.stats.recordTime(id, ms1);
            this.stats.viewTimes();

            this.spaceShips.get(id).finished();
            let n, c;
            n = this.spaceShips.length;
            c = 0;
            for (let [id, spaceShip] of this.spaceShips.entries()) {
                if (!this.spaceShips.get(id).playerState == playerStates.FINISHED) {
                    c++;
                }
            }

            let winnderId = -1;
            if (c == (n - 1)) {
                this.controllerActive = false;
                this.gameFinished = true;
                this.game.time.events.add(5000, function (id) {
                    this.state.start('GameFinished', true, false, id);
                }, this, winnderId);
            }
        }
    }
