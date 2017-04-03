import Phaser from 'phaser'

export default class extends Phaser.Sprite {
    constructor ({ game, x, y, asset }) {
        super(game, x, y, asset)
        this.anchor.setTo(0.5)
        //  Game input
        this.cursors = game.input.keyboard.createCursorKeys();
        this.thrust = false;
    }

    initializePhysics() {
        this.body.drag.set(100);
        this.body.maxVelocity.set(200);
        this.body.gravity.set(0, 200);
        this.body.collideWorldBounds=true;
        this.body.bounce.setTo(0.4, 0.4);
    }

    thrustOn() {
        this.thrust = true;
    }

    thrustOff() {
        this.thrust = false;
    }


    update () {
        if (this.thrust)
        {
            this.game.physics.arcade.accelerationFromRotation(this.rotation - Math.PI / 2, 350, this.body.acceleration);
        }
        else
        {
            this.body.acceleration.set(0);
        }

       /* if (this.cursors.left.isDown)
        {
            this.body.angularVelocity = -300;
        }
        else if (this.cursors.right.isDown)
        {
            this.body.angularVelocity = 300;
        }
        else
        {
            this.body.angularVelocity = 0;
        }

        this.game.worldBoaderCollide(this);*/
    }

}