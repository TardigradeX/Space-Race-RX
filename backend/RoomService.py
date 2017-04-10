from Room import Room
from User import User

import Commands_util as cutil
from Commands import Commands, Targets, Defaults



class RoomService(object):
    def __init__(self):
        self.__freeclients = [] #  list of peers (str())

        self.__service = {} # <roomid>:<Room>
        self.__userlocation = {} # <tcp>:roomid

        self.__lastroomid = 0

    def __deleteMaster(self, peer):
        success = False
        roomid = self.__userlocation[peer]
        userList = self.__service[roomid].getPlayers()
        for x in userList:
            self.__deleteController(x.peer)
            x.client.sendClose()
            print("Close sent to", x.client.peer)

        self.__userlocation.pop(peer)
        self.__service.pop(roomid)
        success = True
        return(success, None)

    def __deleteController(self, peer):
        if not peer in self.__userlocation:
            return(False, None)

        success = False
        roomid = self.__userlocation.pop(peer)
        self.__service[roomid].deleteController(peer)
        success = True
        return(success, None)

    def passMessageToMaster(self, sourcepeer, payload):
        if not sourcepeer in self.__userlocation:
            print("Client unkown")
            return(None)
        roomid = self.__userlocation[sourcepeer]
        self.__service[roomid].master.client.sendMessage2(payload)

    def addNewClient(self, peer):
        """
            no removal, since clients are moved from freeclient list to
            <service> or <userlocation>
        """
        self.__freeclients.append(peer)

    def addRoom(self, client, nPlayers = 4):
        if not client.peer in self.__freeclients:
            print("Client unknown")
            return(None)
        ## any client can become a master here, handling within server.py
        user = User(client, self.__lastroomid, isMaster = True )
        room = Room(user, nPlayers)
        self.__service[room.roomid] = room
        self.__userlocation[client.peer] = room.roomid

        self.__freeclients.remove(client.peer)
        self.__lastroomid += 1
        return(room.roomid)

    def addUser(self, client, roomid):
        if not client.peer in self.__freeclients:
            print("Client has to be registered first")
            return(False,"")
        if not roomid in self.__service:
            print("Room not available")
            return(False,"")

        user = User(client, roomid, isMaster = False)
        print("Adding controller to room", user.roomid)
        success = self.__service[user.roomid].addController(user)
        print(success)
        if success:
            self.__userlocation[user.peer] = user.roomid
            self.__freeclients.remove(client.peer)
            return(success, self.__service[user.roomid].getPlayerId(client.peer))

        return(False,"")

    def getUser(self, roomid, peer):
        playerId = self.__service[roomid].getPlayerId(peer)
        return(self.__service[roomid].getPlayer(playerId))

    def getUserRoomid(self, peer):
        return(self.__userlocation[peer])

    def isMaster(self, peer):
        roomid = self.__userlocation[peer]
        if not roomid in self.__service:
            return False
        return(self.__service[roomid].peer == peer)

    def deleteClient(self, peer):
        success = False
        userList = None
        if not peer in self.__userlocation:
            return(True, None)

        if self.isMaster(peer):
            success, userList = self.__deleteMaster(peer)
        else:
            success, userList = self.__deleteController(peer)
        print("<<<", peer, "deleted")
        return(success, userList)

    def listRooms(self):
        return(self.__service)

    def controllSpaceship(self, sourcepeer, command):
        targetType = Targets.MASTER
        roomid = self.getUserRoomid(sourcepeer)
        room = self.__service[self.__userlocation[sourcepeer]]
        targetPlayerId = room.getPlayerId(sourcepeer)

        msg = cutil.createGameCommand(command, targetType,roomid, targetPlayerId)
        room.master.client.sendMessage2(msg)
