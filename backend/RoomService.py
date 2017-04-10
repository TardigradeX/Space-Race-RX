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

    def passMessage(self, sourcepeer, target, payload):
        """ identify player """
        targetType = None
        roomId = None
        targetPlayerId = None

        print("Message from", sourcepeer, "to", target)
        # target defines if source is master
        if not sourcepeer in self.__userlocation:
            print("User not registered")
            return(False)

        targetType, roomId = target.split(Defaults.TARGET_DELIMETER)[0:2]
        room = self.__service[roomId]
        if targetType.startswith(Targets.MASTER):
            # send message from player to master
            playerId = room.getPlayerId(sourcepeer)
            print (playerId)
            print("Message from player",sourcepeer, "=" , str(playerId), "to", target)
            msg = cutil.createMessage(sourcepeer,\
                    Targets.MASTER, roomId, str(playerId), payload)
            # message = Commands.MESSAGE + Defaults.DELIMETER + \
            #           Targets.MASTER + Defaults.TARGET_DELIMETER +\
            #           roomId + Defaults.TARGET_DELIMETER + str(playerId)+\
            #           Defaults.DELIMETER+payload
            room.master.client.sendMessage2(msg)

        elif targetType.startswith(Targets.CONTROLLER):
            # send message from master to target player
            print('Message from master to', target)
            i = int(targetType.replace(Targets.CONTROLLER, '')) - 1
            client = room.getUser(i)
            if client == None:
                room.master.client.sendMessage2(target+" not found")
            else:
                client.client.sendMessage2(payload)

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
            return(False,"")
        if not roomid in self.__service:
            print("Room not available")
            return(False,"")

        user = User(client, roomid, isMaster = False)
        print("Adding controller to room", user.roomid)
        success = self.__service[user.roomid].addController(user)
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
