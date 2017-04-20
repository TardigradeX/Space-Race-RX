import Phaser from 'phaser'


export default class extends Phaser.BitmapText {
  constructor ({game, x, y, font, size}) {
    super(game, x, y, font, '00:00:00', size, 'center');
    this.game = game;

    this.milliseconds = false;
    this.event = undefined;
    this.isCountdown = false;

    this.timer = game.time.create(true);
  }

  update(){
    let t1, s1;
    t1 = this.isCountdown ? (this.event.delay + Phaser.Timer.SECOND) - this.timer.ms : this.timer.ms;
    s1 = this.formatSeconds(t1);
    this.text = s1;
  }

  start(){
    this.timer.start();
  }

  stop(){
    this.timer.stop();
  }

  pause(){
    this.timer.pause();
  }

  resume(){
    this.timer.resume();
  }

  reset(resetCountdown){
    this.timer.stop();
    this.timer = this.game.time.create(true);
    if(resetCountdown){
      this.isCountdown = false;
    }
  }

  countdown(delay, callback, callbackEnvironment){
    this.event = this.timer.add(delay, callback, callbackEnvironment);
    this.isCountdown = true;
    console.log(this.event.delay);
  }
  getMilliseconds() {
      return(this.formatMilliseconds(this.timer.ms));
  }

  formatMilliseconds(ms) {
    if(ms < 0) return("0:00:00");
    this.minutes = Math.floor(ms / 60000) % 60;
    this.seconds = Math.floor(ms / 1000) % 60;
    this.milliseconds = Math.floor(ms) % 100;
    //If any of the digits becomes a single digit number, pad it with a zero    if (milliseconds < 10)        milliseconds = '0' + milliseconds;
    if (this.seconds < 10)        this.seconds = '0' + this.seconds;
    if (this.minutes < 10)        this.minutes = '0' + this.minutes;
    return(this.minutes + ':'+ this.seconds + ':' + this.milliseconds);
  }

  formatSeconds(ms) {
    if(ms < 0) return("0:00");
    this.minutes = Math.floor(ms / 60000) % 60;
    this.seconds = Math.floor(ms / 1000) % 60;
    //If any of the digits becomes a single digit number, pad it with a zero    if (milliseconds < 10)        milliseconds = '0' + milliseconds;
    if (this.seconds < 10)        this.seconds = '0' + this.seconds;
    return(this.minutes + ':'+ this.seconds);
  }
}
