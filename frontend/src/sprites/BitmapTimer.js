import Phaser from 'phaser'


export default class extends Phaser.BitmapText {
  constructor ({game, x, y, font, size}) {
    super(game, x, y, font, '00:00:00', size, 'center');
    this.game = game;

    this.anchor.setTo(0.5);
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

  formatMilliseconds(ms) {
    let minutes, seconds, milliseconds;
    if(ms < 0) return("0:00:00");
    minutes = Math.floor(ms / 60000) % 60;
    seconds = Math.floor(ms / 1000) % 60;
    milliseconds = Math.floor(ms) % 100;
    //If any of the digits becomes a single digit number, pad it with a zero    if (milliseconds < 10)        milliseconds = '0' + milliseconds;
    if (seconds < 10)        seconds = '0' + seconds;
    if (minutes < 10)        minutes = '0' + minutes;
    return(minutes + ':'+ seconds + ':' + milliseconds);
  }

  formatSeconds(ms) {
    let minutes, seconds;
    if(ms < 0) return("0:00");
    minutes = Math.floor(ms / 60000) % 60;
    seconds = Math.floor(ms / 1000) % 60;
    //If any of the digits becomes a single digit number, pad it with a zero    if (milliseconds < 10)        milliseconds = '0' + milliseconds;
    if (seconds < 10)        seconds = '0' + seconds;
    return(minutes + ':'+ seconds);
  }

}
