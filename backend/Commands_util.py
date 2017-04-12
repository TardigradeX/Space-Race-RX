from Commands import Commands, Targets, Defaults, Payloads

dd = Defaults.DELIMETER
dt = Defaults.TARGET_DELIMETER
dn = Defaults.NONE

""" COMMANDS TO BE SENT BY ANY """
def createLogin(targetType, roomid = dn ):
    playerId = dn
    payload = dn
    target = dt.join([targetType, roomid, playerId])
    msg = dd.join([Commands.LOGIN, target, payload])
    return(msg)

def createLoginResponse(targetType, roomid, playerId):
    target = dt.join([targetType, roomid, playerId])
    payload = Payloads.SIGNUP;
    msg = dd.join([Commands.LOGIN, target, payload])
    return(msg)

def createPlayerJoined(roomid, playerId):
    targetType = Targets.MASTER
    payload = Payloads.JOINED
    target = dt.join([targetType, roomid, playerId])
    msg = dd.join([Commands.LOGIN, target, payload])
    return(msg)

def createAnswer(targetType, roomid, playerId, payload):
    target = dt.join([targetType, roomid, playerId])
    msg = dd.join([Commands.ANSWER, target, payload])
    return(msg)
    
def createMessage(source, targetType, roomid, playerId, payload):
    target = dt.join([targetType, roomid, playerId])
    msg = dd.join([Commands.MESSAGE, target, payload])
    return(msg)

def createLogout(roomid, playerId):
    payload = dn
    targetType = Targets.MASTER
    roomid = roomid
    targetPlayer = playerId
    payload = dn
    target = dt.join([targetType, roomid, playerId])
    msg = dd.join([Commands.LOGOUT, target, payload])
    return(msg)

""" COMMANDS CREATED BY CONTROLLER ONLY """
def createGameCommand(command, targetType, roomid = Defaults.NONE, playerId = Defaults.NONE):
    roomid = roomid
    targetPlayer = playerId
    target = dt.join([targetType, roomid, playerId])

    payload = dn
    msg = dd.join([command, target, payload])
    return(msg)
