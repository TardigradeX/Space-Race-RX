/**
 * Created by daniel on 4/7/17.
 */

import commands from './commands.js'

export class Player {

    constructor(id) {
        this.id = id;
        this.playerState = commands.playerState.ALIVE;
    }
}