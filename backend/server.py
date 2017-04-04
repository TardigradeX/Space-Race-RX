import sys
import random
import re
import enum

from Room import Room
from User import User
from Commands import Commands

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
            user1 = User(peer, self.roomid, isMaster = True)
            room1 = Room(user1)
            self.roomService[self.roomid] = room1
            # x.sendMessage((u"Room number: " + room1.roomid()).encode('utf8'), isBinary = False)
            self.roomid += 1
        return(self.roomid - 1)

    def delRoom(self, roomid):
        """ Remove all clients before deleting """
        print("Closing connection to clients")
        ## master is still in list, fix it
        usersLeft = self.roomService[roomid].getAllUser()[::-1] # controllers first, master last

        print("Deleting room")
        self.roomService.pop(roomid)
        return(usersLeft)

    def registerController(self, peer, roomid):
        if not roomid in self.roomService:
            raise Exception("Room not available")
        print('Adding controller to room')
        user1 = User(peer, roomid, isMaster = False)
        self.roomService[roomid].addController(user1)

    def unregisterController(self, peer, roomid):
        self.roomService[roomid].delController(peer)

    def unregister(self, client):
        print("Unregistering client")
        for roomid in self.roomService.keys():
            room = self.roomService[roomid]
            if client.peer in room.getMaster().peer():
                self.delRoom(roomid)
                break
            if client.peer in [x.peer() for x in room.getControllers()]:
                room.delController(client.peer)
                break

class SpaceRaceRXProtocol(WebSocketServerProtocol):

    def sendMessage2(self, payload):
        self.sendMessage(payload.encode('utf8'), False)

    def parseMessage(self, payload):
        pattern = re.compile('.+|.+|.+')
        isCmd = (pattern.search(payload) == True)
        cmd, target, payload = payload.split('|')

        if cmd == Commands.LOGINMASTER:
            self.factory.addRoom(self)
        elif cmd == Commands.LOGINCONTROLLER:
            roomid = target ## requires parsing
            self.factory.registerController(self, roomid)

    def onConnect(self, request):
        print("Connected to Server: {}".format(request.peer))
        # how to identify whether request is master or client?
        self.factory.addHangman(request.peer)
        self.sendMessage(("Welcome" + request.peer).encode('utf8'), isBinary = False)

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
