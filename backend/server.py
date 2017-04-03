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
        self.clients=[]

    def register(self, client):
        self.clients.append(client);

    def unregister(self, client):
        self.clients.remove(client)

    def communicate(self, incomingClient, payload, isBinary):
        for client in self.clients:
            if client.peer != incomingClient.peer:
                client.sendMessage(payload)




class SpaceRaceRXProtocol(WebSocketServerProtocol):

    def onOpen(self):
        self.factory.register(self)

    def connectionLost(self, reason):
        self.factory.unregister(self)

    def onMessage(self, payload, isBinary):
        self.factory.communicate(self, payload, isBinary)


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
