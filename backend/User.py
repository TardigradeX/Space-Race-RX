
class User():

    def __init__(self, client, roomid, isMaster):
        self.__client = client
        self.__peer = client.peer
        self.peer = self.__peer

        if type(roomid) == type(int()):
            roomid = str(roomid).zfill(4)
        self.__roomid = roomid
        self.__isMaster = isMaster

    def client(self):
        return(self.__client)

    def peer(self):
        return(self.__peer)

    def roomid(self):
        return(self.__roomid)

    def isMaster(self):
        return(self.__isMaster)
