from Room import Room
from User import User
from Commands import Commands, Targets, Defaults

class RoomService(object):
    def __init__(self):
        self.__freeclients = [] #  list of peers (str())

        self.__service = {} # <roomid>:<Room>
        self.__userlocation = {} # <tcp>:roomid

        self.__lastroomid = 0

    def __delUser(self, peer):
        success = False
        if not peer in self.__userlocation:
            return (success, None)

        roomid = self.__userlocation[peer]

        self.__service[roomid].delController(peer)
        self.__userlocation.pop(peer)
        success = True
        return(success)

    def __delRoom(self, roomid):
        success = False
        if not roomid in self.__service:
            return (success, None)

        """ Take care of controllers """
        userList = [x.peer for x in self.__service[roomid].getPlayers()]
        for peer in userList:
            self.delClient(peer)

        print(self.__service[roomid].master.peer)
        self.__service[roomid].master.client.sendClose()
        self.__userlocation.pop(self.__service[roomid].master.peer)
        self.__service.pop(roomid)
        success = True
        return(success, userList)

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

        tmp = target.split(Defaults.TARGET_DELIMETER)
        if len(tmp) == 2:
            targetType, roomId = tmp
        elif len(tmp) == 3:
            targetType, roomId, targetPlayerId = tmp
        else:
            raise Exception("Wrong target format")


        room = self.__service[roomId]
        if targetType.startswith(Targets.MASTER):
            # send message from player to master
            playerId = room.getPlayerId(sourcepeer)
            print (playerId)
            print("Message from player",sourcepeer, "=" , str(playerId), "to", target)
            message = Commands.MESSAGE + Defaults.DELIMETER + \
                      Targets.MASTER + Defaults.TARGET_DELIMETER +\
                      roomId + Defaults.TARGET_DELIMETER + str(playerId)+Defaults.DELIMETER+payload
            room.master.client.sendMessage2(message)

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

    def delClient(self, peer):
        success = False
        userList = None
        """
        return <success, clientList[]>
         - clientList is for master, None otherwise
        """
        if not peer in self.__userlocation:
            print("Client not in list")
            return(success, userList)

        roomid = self.__userlocation[peer]
        room = self.__service[roomid]
        if peer == room.master.peer:
            success, userList = self.__delRoom(roomid)
            return(success, userList)
        else:
            success = self.__delUser(peer)
            return(success, userList)

    def getUser(self, roomid, peer):
        playerId = self.__service[roomid].getPlayerId(peer)
        return(self.__service[roomid].getPlayer(playerId))

    def getUserLocation(self, peer):
        return(self.__userlocation[peer])

    def listRooms(self):
        return(self.__service)

    def controllCommand(self, sourcepeer, command):
        cmd, target, payload = command.split("|")
        targetType, roomid, targetPlayerId = target.split(Defaults.TARGET_DELIMETER)

        room = self.__service[self.__userlocation[sourcepeer]]
        print("Room stats:")
        print(room.roomid)
        print(room.master.peer)
        print("")
        sourceId = room.getPlayerId(sourcepeer)
        if targetType == Targets.MASTER:
            room.master.client.sendMessage2(sourceId + "|" + command)
        elif targetType == Targets.CONTROLLER:
            room.getPlayer(targetType).client.sendMessage2(sourceId+"|"+command)
