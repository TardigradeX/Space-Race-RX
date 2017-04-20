
import Phaser from 'phaser'


export default class extends Phaser.BitmapText {

  constructor ({game, state, x, y, font, size}) {
    super(game, x, y, font, '00:00:00', size, 'center');

    this.milliseconds = 0;
    this.seconds = 0;
    this.minutes = 0;

    this.game.add.existing(this);
    this.reset();
  }

  start(){
    this.reset();
    this.timeStart = this.game.time.now;
  }

  stop(){

  }

  update() {
	  //  this.minutes = Math.floor(this.game.time.time / 60000) % 60;
    //  this.seconds = Math.floor(this.game.time.time / 1000) % 60;
    //  this.milliseconds = Math.floor(this.game.time.time) % 100;
    //  //If any of the digits becomes a single digit number, pad it with a zero    if (milliseconds < 10)        milliseconds = '0' + milliseconds;
    //  if (this.seconds < 10)        this.seconds = '0' + this.seconds;
    //  if (this.minutes < 10)        this.minutes = '0' + this.minutes;
    //  this.setText(this.minutes + ':'+ this.seconds + ':' + this.milliseconds);
    this.setText(this.state.time.now - this.timeStart);
   }
}
