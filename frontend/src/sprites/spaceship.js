import Phaser from 'phaser'


export default class extends Phaser.Sprite {
    constructor ({ game, x, y, asset }) {
        super(game, x, y, asset);
        this.x = x;
        this.y = y;

        this.anchor.setTo(0.5);
        this.movement = "none";

        this.emitter = this.game.add.emitter(0,0,100);
        this.emitter.makeParticles('explosion');
        // this.emitter.setAlpha(1, 0, 3000);

        this.isFinished = false;
    }

    setMovement(movement) {
        this.movement = movement;
    }

    update(){
      this.emitter.x = this.x;
      this.emitter.y = this.y;
    }

    explode(){
      if(this.emitter === null){
        console.log('Emitter not set');
        return(null);
      }
      this.emitter.x = this.x;
      this.emitter.y = this.y;

      console.log('!!!Spaceship explosion!!!');
      console.log("coordinates", this.emitter.x, this.emitter.y);
      this.isFinished = false;

      this.emitter.start(false, 4000, 100, 5000);
      this.emitter.update();

      this.alpha = 0.1;
    }
}
