

class Room(object):
    def __init__(self, User, nPlayers = 2):
        if not User.isMaster():
            raise Exception("Not a master user")

        roomid = User.roomid()
        if type(roomid) == type(int()):
            roomid = str(roomid).zfill(4)
        self.__roomid = roomid

        self.__master = User
        self.master = self.__master

        self.__controller = [None]*nPlayers

    def addController(self, User):
        success = False
        """ add controller to list, check if valid """
        n = sum([1 for x in self.__controller if x == None])
        print("Slots left: " + str(n))
        if n > 0:
            i = self.__controller.index(None)
            print("Added user to slot", i)
            self.__controller[i] = User
            success = True
        else:
            success = False
            # User.client().sendMessage2("Room is full. Closing...")
            # User.client().sendClose()

        return success

    def delController(self, peer):
        """ remove controller from list """
        contpeer = [x.peer for x in self.__controller if x != None]
        print(peer, contpeer)
        i = contpeer.index(peer)
        del self.__controller[i]
        print("Removed controller "+ peer + " from room " + self.__roomid)

    def getMaster(self):
        return(self.__master)

    def getControllers(self):
        return([x for x in self.__controller if x != None])

    def getPlayerId(self, peer):
        """ remove controller from list """
        contpeer = [x.peer for x in self.__controller if x != None]
        return contpeer.index(peer)+1

    def getAllUser(self):
        return([self.__master] + [x for x in self.__controller if x != None])

    def getUser(self, i):
        return(self.__controller[i])

    def roomid(self):
        return(self.__roomid)
