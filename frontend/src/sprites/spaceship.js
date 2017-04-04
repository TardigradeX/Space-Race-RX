import Phaser from 'phaser'

export default class extends Phaser.Sprite {
    constructor ({ game, x, y, asset }) {
        super(game, x, y, asset);
        this.anchor.setTo(0.5);
        this.thrustLeft = false;
        this.thrustRight = false;
    }


    thrustLeftOn() {
        this.thrustLeft = true;
    }

    thrustLeftOff() {
        this.thrustLeft = false;
    }

    thrustRightOn() {
        this.thrustRight = true;
    }

    thrustRightOff() {
        this.thrustRight = false;
    }

}