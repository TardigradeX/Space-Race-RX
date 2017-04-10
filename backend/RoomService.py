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
        roomid = self.__userlocation[peer]

        self.__service[roomid].delController(peer)
        self.__userlocation.pop(peer)

    def __delRoom(self, roomid):
        if not roomid in self.__service:
            return False

        """ Take care of controllers """

        print(self.__service[roomid].getMaster().peer)
        self.__userlocation.pop(self.__service[roomid].getMaster().peer)
        self.__service.pop(roomid)

    def passMessage(self, sourcepeer, target, payload):
        """ identify player """
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
            print("Message from player"+sourcepeer+"=" + str(playerId) +"to"+target)
            message = Commands.MESSAGE + Defaults.DELIMETER + \
                      Targets.MASTER + Defaults.TARGET_DELIMETER +\
                      roomId + Defaults.TARGET_DELIMETER + str(playerId)+ Defaults.DELIMETER+payload
            room.getMaster().client().sendMessage2(message)

        elif targetType.startswith(Targets.CONTROLLER):
            # send message from master to target player
            print('Message from master to', target)
            i = int(targetType.replace(Targets.CONTROLLER, '')) - 1
            client = room.getUser(i)
            if client == None:
                room.getMaster().client().sendMessage2(target+" not found")
            else:
                client.client().sendMessage2(payload)

    def addNewClient(self, peer):
        """
            no removal, since clients are moved from freeclient list to
            <service> or <userlocation>
        """
        self.__freeclients.append(peer)

    def addRoom(self, client, nPlayers = 4):
        if not client.peer in self.__freeclients:
            return(None)
        ## any client can become a master here, handling within server.py
        user = User(client, self.__lastroomid, isMaster = True )
        room = Room(user, nPlayers)
        self.__service[room.roomid()] = room
        self.__userlocation[client.peer] = room.roomid()

        self.__freeclients.remove(client.peer)
        self.__lastroomid += 1
        return(room.roomid())

    def addUser(self, client, roomid):
        if not client.peer in self.__freeclients:
            return(False,"")
        if not roomid in self.__service:
            print("Room not available")
            return(False,"")

        user = User(client, roomid, isMaster = False)
        print("Adding controller to room", user.roomid())
        success = self.__service[user.roomid()].addController(user)
        if success:
            self.__userlocation[user.peer] = user.roomid()
            self.__freeclients.remove(client.peer)
            return(success, self.__service[user.roomid()].getPlayerId(client.peer))

        return(False,"")

    def delClient(self, peer):
        roomid = None
        print("Current peer",peer,
        "- User list:", self.__userlocation,
        "- User found:", peer in self.__userlocation)
        if not peer in self.__userlocation:
            print("Client not in list")
            return(False, None)
        try:
            roomid = self.__userlocation[peer]
        except Exception as e:
            raise "Client does not exist"

        room = self.__service[roomid]
        if peer == room.getMaster().peer:
            self.__delRoom(roomid)
            return(True, True)
        else:
            self.__delUser(peer)
            return(True, False)

    def getUser(self, roomid, idx):
        return(self.__service[roomid].getUser(idx))

    def getUserLocation(self, peer):
        return(self.__userlocation[peer])

    def getUsers(self, roomid):
        return(self.__service[roomid].getControllers())

    def listRooms(self):
        return(str(self.__service))
