
class User():

    def __init__(self, client, roomid, isMaster):
        self.client = client
        self.peer = self.client.peer

        if type(roomid) == type(int()):
            roomid = str(roomid).zfill(4)
        self.roomid = roomid
        self.isMaster = isMaster
    
