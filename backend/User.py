
class User():

    def __init__(self, client, roomid, isMaster):
        self.client = client
        self.peer = self.client.peer

        if type(roomid) == type(int()):
            roomid = str(roomid).zfill(4)
        self.roomid = roomid
        self.isMaster = isMaster
        self.client.onClose = self.onClose

    def onClose(self, wasClean, code, reason):
        if not wasClean:
            print(self.peer, code, reason)
        else:
            print(self.peer,'signed off')
