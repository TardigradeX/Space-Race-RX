

class Room(object):
    def __init__(self, User):
        roomid = User.roomid()
        if type(roomid) == type(int()):
            roomid = str(roomid).zfill(4)
        self.__roomid = User.roomid()

        if not User.isMaster():
            raise Exception("Not a master user")

        self.__master = User

        self.__controller = [None]*4

    def addController(self, peer):
        """ add controller to list, check if valid """
        n = [1 for x in self.__controller if x == None]
        if n > 0:
            i = self.__controller.index(None)
            self.__controller[i] = peer

    def delController(self, peer):
        """ remove controller from list """
        self.__controller.pop(peer)

    def getControllers(self):
        return([x for x in self.__controller if x != None])

    def getMaster(self):
        return(self.__master)

    def getAllUser(self):
        return([self.__master] + [x for x in self.__controller if x != None])

    def roomid(self):
        return(self.__roomid)
