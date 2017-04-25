import Phaser from 'phaser'


export default class extends Phaser.Group {
  constructor ({game, name, x, y, font, size}) {
    super(game)
    this.game = game;

    this.font = font;
    this.size = size;
    this.x = x;
    this.y = y;

    this.playertime = [];
    this.playerorder = [];

    this.bmtext = [];

    this.game.add.existing(this);

  }

  recordTime(id, ms){
    if(this.playerorder.indexOf(id) === -1){
      this.playerorder.push(id);
      this.playertime.push(ms);
    }
  }

  formatText(rank, id, time){
    return(id + " - " + time);
  }

  viewTimes(){
    let ctext, s1;
    //Phaser.GameObjectCreator.bitmapText(x, y, font, text, size) : Phaser.BitmapText;
    for(let i = 0; i < this.playerorder.length; i++){
      s1 = this.formatText((i+1),this.playerorder[i],  this.formatMilliseconds(this.playertime[i]));
      ctext = this.game.add.bitmapText(this.x, this.y + (this.size *i) + (5 *(i>0)), this.font, s1, this.size);
      this.bmtext.push(ctext);
    }
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
}
