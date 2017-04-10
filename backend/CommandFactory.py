from Commands import Commands, Targets, Defaults, Payloads

dd = Defaults.DELIMETER
dt = Defaults.TARGET_DELIMETER
dn = Defaults.NONE

""" COMMANDS TO BE SENT BY ANY """
def createLogin(targetType, roomid = dn ):
    targetPlayerId = dn
    payload = dn
    target = dt.join([targetType, roomid, targetPlayerId])
    msg = dd.join([Commands.LOGIN, target, payload])
    return(msg)

def createLoginResponse(targetType, roomid, playerId):
    target = dt.join([targetType, roomid, playerId])
    payload = Payloads.SIGNUP;
    msg = dd.join([Commands.MESSAGE, target, payload])
    return(msg)

def createMessage(source, targetType, roomid, targetPlayer, payload):
    target = dt.join([targetType, roomid, targetPlayer])
    msg = dd.join([Commands.MESSAGE, target, payload])
    return(msg)

def createLogout():
    payload = dn
    targetType = Targets.SERVER
    roomid = dn
    targetPlayer = dn
    payload = dn
    target = dt.join([targetType, roomid, targetPlayer])
    msg = dd.join([Commands.LOGOUT, target, payload])
    return(msg)

""" COMMANDS CREATED BY CONTROLLER ONLY """
def createGameCommand(command, targetType):
    roomid = dn
    targetPlayer = dn
    target = dt.join([targetType, roomid, targetPlayer])

    payload = dn
    msg = dd.join([command, target, payload])
    return(msg)
