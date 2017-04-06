import sys
import random
import re
import enum

from User import User
from Room import Room
from RoomService import RoomService
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

        self.roomService = RoomService()

    def addNewClient(self, peer):
        self.roomService.addNewClient(peer)

    def addRoom(self, client):
        roomid = self.roomService.addRoom(client)
        return(roomid)

    def registerController(self, client, roomid):
        success = self.roomService.addUser(client, roomid)
        return(success)

    def unregister(self, peer):
        success, isRoom = self.roomService.delClient(peer)
        print("worked",success,", isMaster:", isRoom)

    def passMessage(self, sourcepeer, target, payload):
        self.roomService.passMessage(sourcepeer, target, payload)


class SpaceRaceRXProtocol(WebSocketServerProtocol):

    def sendMessage2(self, payload):
        self.sendMessage(payload.encode('utf8'), False)

    def parseMessage(self, payload):
        pattern = re.compile('.+\|.+\|.+')
        isCmd = bool(pattern.search(payload))
        if not isCmd:
            return(None)
        """
            Recognized commands are of form cmd|target|payload
            if payload = '$', it is an empty string
            Login - master: login|master|$
              - controller: login|controller|roomid

            Logout          logout|server|$
                [not yet implemented]

             Message:       message|target|Message
                target := (master, controller1, ..., controller4)
        """

        cmd, target, payload = payload.split('|')

        if cmd == Commands.LOGIN:
            if target == Commands.MASTER:
                roomid = self.factory.addRoom(self)
                self.sendMessage2('Your assigned room id: ' + str(roomid))

            elif target == Commands.CONTROLLER:
                roomid = payload ## requires parsing
                success = self.factory.registerController(self, roomid)
                if not success:
                    self.sendMessage2("Could not sign up to room"+ str(roomid))
                    self.sendClose()
                else:
                    print("Controller " + self.peer + " registered to room" + roomid)

        elif cmd == Commands.MESSAGE:
            self.factory.passMessage(self.peer, target, payload)

        elif cmd == Commands.LOGOUT:
            print("[not implemented] " + self.peer + "sent a logout ")
            pass
        else:
            print("Unknown command - unable to comply")

    def onConnect(self, request):
        # request can be parsed to JSON object!
        print("Connected to Server: {}".format(request.peer))
        # how to identify whether request is master or client?
        self.factory.addNewClient(request.peer)

    def onMessage(self, payload, isBinary):
        pay1 = payload.decode('utf8')
        print(self.peer + ": " + pay1) # which peer?
        self.parseMessage(pay1)
        print("Message parsed")
        print("Room overview")
        print(self.factory.roomService.listRooms())

    def onClose(self, wasClean, code, reason):
        self.factory.unregister(self.peer)

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
