/**
 * Created by daniel on 3/30/17.
 */
/* globals __DEV__ */
import Phaser from 'phaser'

export default class extends Phaser.State {
    init (id) {
        this.winnerId = id;
    };

    preload () {}

    create () {
        const bannerText = 'Player ' + this.winnerId + "has WON :-) ";
        let banner = this.add.text(this.world.centerX, this.game.height - this.game.height/2, bannerText);
        banner.font = 'Bangers';
        banner.padding.set(10, 16);
        banner.fontSize = 80;
        banner.fill = '#1dff28';
        banner.smoothed = false;
        banner.anchor.setTo(0.5);
    }
}
/**
 * Created by daniel on 4/15/17.
 */
