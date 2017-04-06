from Room import Room
from User import User
from Commands import Commands, Targets

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
        print("Message from", sourcepeer, "to", target)
        # target defines if source is master
        roomid = self.__userlocation[sourcepeer]
        room = self.__service[roomid]
        if target.startswith(Targets.MASTER):
            # send message from player to master
            print("Message from player",sourcepeer, "to master")
            room.getMaster().client().sendMessage2(payload)
        elif target.startswith(Targets.PLAYER):
            # send message from master to target player
            print('Message from master to', target)
            i = int(target.replace(Targets.PLAYER, '')) - 1
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
            return(False)

        user = User(client, roomid, isMaster = False)
        print("Adding controller to room", user.roomid())


        self.__service[user.roomid()].addController(user)
        self.__userlocation[user.peer] = user.roomid()

        self.__freeclients.remove(client.peer)
        return(True)

    def delClient(self, peer):
        roomid = None
        print(peer, self.__userlocation, peer in self.__userlocation)

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
