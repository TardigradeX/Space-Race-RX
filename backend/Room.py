

class Room(object):
    def __init__(self, User):
        if not User.isMaster():
            raise Exception("Not a master user")

        roomid = User.roomid()
        if type(roomid) == type(int()):
            roomid = str(roomid).zfill(4)
        self.__roomid = roomid

        self.__master = User

        self.__controller = [None]*1

    def addController(self, User):
        success = False
        """ add controller to list, check if valid """
        n = sum([1 for x in self.__controller if x == None])
        print("Slots left: " + str(n))
        if n > 0:
            i = self.__controller.index(None)
            self.__controller[i] = User
            success = True
        else:
            success = False
            # User.client().sendMessage2("Room is full. Closing...")
            # User.client().sendClose()

        return success

    def delController(self, peer):
        """ remove controller from list """
        contpeer = [x.peer() for x in self.__controller if x != None]
        print(peer, contpeer)
        i = contpeer.index(peer)
        del self.__controller[i]
        print("Removed controller "+ peer + " from room " + self.__roomid)

    def getControllers(self):
        return([x for x in self.__controller if x != None])

    def getMaster(self):
        return(self.__master)

    def getAllUser(self):
        return([self.__master] + [x for x in self.__controller if x != None])

    def roomid(self):
        return(self.__roomid)
