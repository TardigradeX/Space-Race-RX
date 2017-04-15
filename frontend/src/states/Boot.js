import Phaser from 'phaser'
import WebFont from 'webfontloader'

export default class extends Phaser.State {
  init () {
    this.stage.backgroundColor = '#222cbe'
    this.fontsReady = false
    this.fontsLoaded = this.fontsLoaded.bind(this)
  }

  preload () {
    WebFont.load({
      google: {
        families: ['Bangers']
      },
      active: this.fontsLoaded
    })

    let text = this.add.text(this.world.centerX, this.world.centerY, 'loading fonts', { font: '16px Arial', fill: '#dddddd', align: 'center' })
    text.anchor.setTo(0.5, 0.5)

    this.load.bitmapFont('desyrel1', './assets/bitmapFonts/desyrel.png', './assets/bitmapFonts/desyrel.xml');

    // this.load.spritesheet('explosion','./assets/sprites/fruitnveg32wh37.png',32,37, 31 );

    this.load.image('loaderBg', './assets/images/loader-bg.png')
    this.load.image('loaderBar', './assets/images/loader-bar.png')
  }

  render () {
    if (this.fontsReady) {
      this.state.start('DummyDecide');
    }
  }

  fontsLoaded () {
    this.fontsReady = true
  }
}
