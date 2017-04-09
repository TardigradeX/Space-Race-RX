from Commands import Commands, Targets, Defaults

class Room(object):
    def __init__(self, User, maxPlayer = 2):
        if not User.isMaster:
            raise Exception("Not a master user")

        roomid = User.roomid
        if type(roomid) == type(int()):
            roomid = str(roomid).zfill(4)
        self.roomid = roomid
        self.__maxPlayer = maxPlayer

        self.master = User

        self.__controller = {}      # <playerId>:<User>, playerId: player1,...,n, n <= maxPlayer
        self.__controllerMap = {}   # <peer>:<playerId>

    def addController(self, User):
        """ add controller to list, check if valid """
        if len(self.__controller) < self.__maxPlayer:
            playerId = Targets.CONTROLLER + str(len(self.__controller) + 1)

            self.__controllerMap[User.peer] = playerId
            self.__controller[playerId] = User

            return(True)

        return False

    def getPlayer(self, playerId):
        return(self.__controller[playerId])

    def getPlayers(self):
        keys1 = list(self.__controller.keys())
        keys1.sort()
        return([self.__controller[k] for k in keys1])

    def getPlayerByPeer(self, peer):
        playerId = self.__controllerMap[peer]
        return(self.__controller[playerId])

    def getPlayerId(self, peer):
        return(self.__controllerMap[peer])

    def delController(self, peer):
        """ remove controller from list """
        playerId = self.__controllerMap.pop(peer)
        user = self.__controller.pop(playerId)
        user.client.sendClose()
        print("\'"+ playerId + "\' left the room \'" + self.roomid + "\'")

    def getAllUser(self):
        return([self.master.peer] + [self.__controller[k].peer for k in self.__controller])
