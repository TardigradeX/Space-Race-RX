/* globals __DEV__ */
import Phaser from 'phaser'
import SpaceShip from '../sprites/spaceship'

export default class extends Phaser.State {
  init () {}
  preload () {}

  create () {
    const bannerText = 'Xander Ruullled';
    let banner = this.add.text(this.world.centerX, this.game.height - 80, bannerText);
    banner.font = 'Bangers';
    banner.padding.set(10, 16);
    banner.fontSize = 40;
    banner.fill = '#77BFA3';
    banner.smoothed = false;
    banner.anchor.setTo(0.5);

    this.spaceShip = new SpaceShip({
      game: this,
      x: this.world.centerX,
      y: this.world.centerY,
      asset: 'spaceship'
    });

    this.game.add.existing(this.spaceShip);
    this.game.physics.enable(this.spaceShip, Phaser.Physics.ARCADE);
    this.spaceShip.initializePhysics();
  }

  render () {
    if (__DEV__) {
      this.game.debug.spriteInfo(this.spaceShip, 32, 32)
    }
  }
}
