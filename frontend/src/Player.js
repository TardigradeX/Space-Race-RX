/**
 * Created by daniel on 4/7/17.
 */
import {playerStates} from "./commands";


export class Player {

    constructor(id) {
        this._id = id;
        this._playerState = playerStates.ALIVE;
    }

    get id(){
        return this._id;
    }

    get playerState(){
        return this._playerState;
    }
}