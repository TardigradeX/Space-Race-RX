from autobahn.twisted.websocket import WebSocketServerProtocol

class User():

    def __init__(self, peer, roomid, isMaster):
        self.__peer = peer

        if type(roomid) == type(int()):
            roomid = str(roomid).zfill(4)
        self.__roomid = roomid
        self.__isMaster = isMaster

    def peer(self):
        return(self.__peer)

    def roomid(self):
        return(self.__roomid)

    def isMaster(self):
        return(self.__isMaster)
