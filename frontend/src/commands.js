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
};

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
