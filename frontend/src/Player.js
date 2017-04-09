/**
 * Created by daniel on 4/7/17.
 */
import {playerStates} from "./commands";


export class Player {

    constructor(id) {
        this.id = id;
        this.playerState = playerStates.ALIVE;
    }

    id(){
        return this.id;
    }

    playerState(){
        return this.playerState;
    }
}