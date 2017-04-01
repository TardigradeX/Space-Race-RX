import sys
import random
import re


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
        # since connection order is 1) master and 2) controller, this works.
        # Room can be prepared with empty controllers,
        # destroyed as last controller gone
        self.rooms = {} # room peer with ID
        self.ctrl = {} # client with peer with room id
        self.match = {} # room id with (client id)*4
        self.roomuid = -1

    def registerMaster(self, client):
        if client not in self.rooms:
            print("registered client {}".format(client.peer))
            self.roomuid += 1
            self.rooms[client.peer] = str(self.roomuid).zfill(4)
            self.match[self.rooms[client.peer]] = 0
            return(self.rooms[client.peer])

    def registerController(self, client, roomid):
        roomfree = self.checkRoom(roomid)
        if not roomfree:
            self.sendMessage2("Room is not available, either full or it does not exist")
            pass # restart login ask for another room id

        if client not in self.rooms:
            print("registered client {}".format(client.peer))
            self.match[roomid] += 1
            self.ctrl[client.peer] = roomid

    def checkRoom(self, roomid):
        if not roomid in self.match: ## room id must exist
            return 1
        if self.match[roomid] < 4: ## max 4 players
            return 2
        return 0

    def unregister(self, client):
        """
        Remove client from list of managed connections.
        """
        print("Room unregistered:" + str(client.peer))
        try:
            self.clients.pop(client.peer)
        except:
            print("Nothing to unregister: Client " + client.peer + \
                " not registered")

    def broadcast(self, msg):
        print("broadcasting message '{}' ..".format(msg))
        for c in self.clients:
            c.sendMessage(msg.encode('utf8'), False)
            print("message sent to {}".format(c.peer))

class SpaceRaceRXProtocol(WebSocketServerProtocol):

    def parseLogin(self, payload):
        print(payload)
        pattern = re.compile(u'<.+>:.+')
        if bool(pattern.search(payload)):
            c = payload.split(":")
            if c[0] == "<loginrequest>":
                if c[1] == 'master':
                    print('Registering master')
                    roomuid = self.factory.registerMaster(self)
                    self.sendMessage2("<logingranted>:master:"+ roomuid)

                elif c[1] == 'controller':
                    print('Registering controller for room ' + c[2])
                    self.factory.registerController(self, c[2])
                    self.sendMessage2("<logingranted>:controller:room" +c[2])
            else:
                print('Command not recognized')
                self.sendMessage2("login denied")
                self.close()

    def onConnect(self, request):
        print("Connected to Server: {}".format(request.peer))
        print(request)
        print(type(request))
        print(dir(request))

    # def onOpen(self, request):
    #     print(request)

    def connectionLost(self, reason):
        self.factory.unregister(self)

    def onMessage(self, payload, isBinary):
        pay1 = payload.decode('utf8')
        print(self.peer + ": " + pay1)
        self.parseLogin(pay1)

    def sendMessage2(self, payload):
        self.sendMessage(payload.encode('utf8'), False)

    def sendClose(self, code = None, reason = None):
        print("Announce closing with " + self.peer)
        """self.sendClose(code, reason)"""

    def onClose(self):
        print("Closing connection")
        """self.onClose()"""




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
