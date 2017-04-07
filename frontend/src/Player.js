/**
 * Created by daniel on 4/7/17.
 */
import {playerStates} from "./commands";


export class Player {

    constructor(id) {
        console.log("New Players Build Width id" + id);
        console.log("YEAHAAAA" + playerStates.ALIVE)
        this.id = id;
        this.playerState = playerStates.ALIVE;
    }
}