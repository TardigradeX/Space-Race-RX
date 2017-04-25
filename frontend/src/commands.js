/**
 * Created by daniel on 4/6/17.
 */
export const commands = {
    LOGIN : "login",
    LOGOUT : "logout",
    SIGNUP : "signup",
    MESSAGE : "message",

    LEFTROLL : "left",
    RIGHTROLL : "right",
    THRUST : "thrust",
    NONE : "none",

    REQUEST : 'request',
    ANSWER : 'answer',

    READY : 'ready'
};


export const targets = {
    CONTROLLER : "controller",
    MASTER : "master",
    SERVER : "server",
};

export const playerStates = {
    ALIVE : 1,
    DEAD : 0,
    FINISHED: 2,
};

export const colors = [
    0xff0000,
    0x00ff00,
    0xff00ff,
    0x0000ff
];



export const payloads = {
    JOINED : "joined",
    SIGNUP : 'signup',
    FAILED : 'failed',

    LISTROOMS : 'listRooms'
}

export const DELIMETER = "|";
export const TARGET_DELIMETER = ":";
export const NONE = "none";
export const NEW = "new";
