import sys
import random
import re
import enum

from Room import Room
from User import User
from Commands import Commands, Targets

from twisted.web.static import File
from twisted.python import log
from twisted.web.server import Site
from twisted.internet import reactor

from autobahn.twisted.websocket import WebSocketServerFactory, \
    WebSocketServerProtocol

from autobahn.twisted.resource import WebSocketResource

class SpaceRaceRXFactory(WebSocketServerFactory):

    def __init__(self, *args, **kwargs):
        super(SpaceRaceRXFactory, self).__init__(*args, **kwargs)

        self.roomService = {}
        self.hangmans = []  # aka dangling clients, without room nor master/controller assignment
        self.roomid = 0

    def addHangman(self, peer):
        self.hangmans.append(peer)

    def addRoom(self, client):
        peer = client.peer

        if peer not in self.roomService:
            self.hangmans.remove(client.peer)
            print("Adding room")
            user1 = User(client, self.roomid, isMaster = True)
            room1 = Room(user1)
            self.roomService[room1.roomid()] = room1
            self.roomid += 1
        print(self.roomService)
        return(room1.roomid())

    def delRoom(self, roomid):
        """ Remove all clients before deleting """
        print("Closing connection to clients")
        ## master is still in list, fix it
        usersLeft = self.roomService[roomid].getAllUser()[::-1] # controllers first, master last

        print("Deleting room")
        try:
            del self.roomService[roomid]
        except Exception as e:
            raise "Room does not exist..."
        print(self.roomService)

        return(usersLeft)

    def registerController(self, client, roomid):
        if not roomid in self.roomService:
            return False

        print('Adding controller to room')
        user1 = User(client, roomid, isMaster = False)
        ## recommending class roomService for automated room.exists() handling
        success = self.roomService[roomid].addController(user1)

        if success:
            user1.client().sendMessage2('Successfully registered to room ' + roomid)
            self.roomService[roomid].getMaster().client().sendMessage2("Controller registered to room "+roomid)
        return success

    def unregisterController(self, peer, roomid):
        self.roomService[roomid].delController(peer)
        self.roomService[roomid].getMaster().client().sendMessage2( \
        'Controller ' + peer + ' left')

    def unregister(self, client):
        print("Unregistering ")
        for roomid in self.roomService.keys():
            room = self.roomService[roomid]
            masterpeer = room.getMaster().peer()
            controllerpeers = [x.peer() for x in room.getControllers()]
            if client.peer in masterpeer:
                print("-- Room")
                self.delRoom(roomid)
                break
            if client.peer in controllerpeers:
                print("-- Controller")
                self.unregisterController(client.peer, roomid)
                # room.delController(client.peer)
                break
            else:
                print("Room does not exist")

    def passMessage(self, sourcepeer, target, payload):
        key1 = list(self.roomService.keys())
        masterpeer = [self.roomService[k].master.peer for k in key1]
        i = masterpeer.index(sourcepeer)
        j = int(target.replace('player', ''))
        self.roomService[key1[i]].getUser(j-1).client().sendMessage2(payload)

class SpaceRaceRXProtocol(WebSocketServerProtocol):

    def sendMessage2(self, payload):
        self.sendMessage(payload.encode('utf8'), False)

    def parseMessage(self, payload):
        pattern = re.compile('.+\|.+\|.+')
        isCmd = bool(pattern.search(payload))
        if not isCmd:
            return(None)

        cmd, target, payload = payload.split('|')

        if cmd == Commands.LOGINMASTER:
            print("Registering master")
            roomid = self.factory.addRoom(self)
            self.sendMessage2('Your assigned room id: ' + str(roomid))
        elif cmd == Commands.LOGINCONTROLLER:
            roomid = target ## requires parsing
            print("Registering controller to room " + roomid)
            success = self.factory.registerController(self, roomid)
            if not success:
                self.sendMessage2("Unable to comply")
                self.sendClose()
        elif cmd == Commands.MESSAGE:
            print("Receiving a message for " + target)
            self.factory.passMessage(self.peer, target, payload)
        else:
            print("Unknown command")

    def onConnect(self, request):
        # request can be parsed to JSON object!
        print("Connected to Server: {}".format(request.peer))
        # how to identify whether request is master or client?
        self.factory.addHangman(request.peer)

    def onMessage(self, payload, isBinary):
        pay1 = payload.decode('utf8')
        print(self.peer + ": " + pay1) # which peer?
        self.parseMessage(pay1)
        print("Message parsed")

    def onClose(self, wasClean, code, reason):
        self.factory.unregister(self)

if __name__ == "__main__":
    port = 9000 # tcp port

    log.startLogging(sys.stdout)

    # static file server seving index.html as root
    root = File(".")

    factory = SpaceRaceRXFactory(u"ws://127.0.0.1:"+str(port))
    factory.protocol = SpaceRaceRXProtocol
    resource = WebSocketResource(factory)
    # websockets resource on "/ws" path
    root.putChild(b"ws", resource)

    site = Site(root)
    reactor.listenTCP(port, site)
    # reactor.listenTCP(8080, factory)

    reactor.run()
