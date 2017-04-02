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
        self.master = None
        self.controller = None

    def unregister(self, client):
        if client.peer == self.controller:
            controller = None

        if client.peer == self.master:
            master = None

    def broadcast(self, msg):
        print("broadcasting message '{}' ..".format(msg))
        for c in self.clients:
            c.sendMessage(msg.encode('utf8'), False)
            print("message sent to {}".format(c.peer))

class SpaceRaceRXProtocol(WebSocketServerProtocol):


    def onConnect(self, request):
        if self.master is None:
            self.master = request.peer
        else:
            self.controller = request.peer

    def connectionLost(self, reason):
        self.factory.unregister(self)

    def onMessage(self, payload, isBinary):
        self.sendMessage(payload.encode('utf8'), False)

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
