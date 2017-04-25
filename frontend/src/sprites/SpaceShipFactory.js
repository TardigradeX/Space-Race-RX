/**
 * Created by daniel on 4/4/17.
 */
import SpaceShip from '../sprites/spaceship'

export default class SpaceShipFactory {
    constructor ({ game }) {
        this.game = game;
    }

    getSpaceShip(x,y,asset) {
        let ship = new SpaceShip({
            game: this.game,
            x: x,
            y: y,
            asset: asset
        });

        ship.scale.setTo(0.5, 0.5);

        this.game.add.existing(ship);
        this.game.physics.enable(ship, Phaser.Physics.ARCADE);

        ship.body.drag.set(100);
        ship.body.maxVelocity.set(200);
        ship.body.gravity.set(0, 0);
        ship.body.collideWorldBounds=true;
        ship.body.bounce.setTo(0.4, 0.4);

        return ship;
    }
}
