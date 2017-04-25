import Phaser from 'phaser';
import {playerStates} from '../commands'

export default class extends Phaser.Sprite {
    constructor({game, x, y, asset}) {
        super(game, x, y, asset);
        this.x = x;
        this.y = y;

        this.anchor.setTo(0.5);
        this.movement = "none";
        this.playerState = playerStates.ALIVE;
    }

    setMovement(movement) {
        this.movement = movement;
    }

    explode() {
        this.playerState = playerStates.DEAD;
        this.emitter = this.game.add.emitter(this.x, this.y, 6);
        this.emitter.makeParticles('explosion');
        this.emitter.width = 20;
        this.emitter.height = 20;
        this.emitter.minParticleScale = 0.5;
        this.emitter.maxParticleScale = 3;
        this.emitter.minParticleSpeed.set(0, 0);
        this.emitter.maxParticleSpeed.set(0, 0);
        this.emitter.gravity = 0;
        this.emitter.start(false, 1000, 50, 6);
        this.alpha = 0.0;
        this.game.time.events.add(
            1000,
            function () {this.emitter.destroy()},
            this
        );
    }

    finished() {
        this.playerState = playerStates.FINISHED;
        this.alpha = 0.0;
    }

    repair() {
        this.playerState = playerStates.ALIVE;
        this.alpha = 1.0;
    }
}
