import sys
import random

from twisted.web.static import File
from twisted.python import log
from twisted.web.server import Site
from twisted.internet import reactor

from autobahn.twisted.websocket import WebSocketServerFactory, \
    WebSocketServerProtocol

from autobahn.twisted.resource import WebSocketResource

class SpaceRaceRXProtocol(WebSocketServerProtocol):

    def onConnect(self, response):
        print("Connected to Server: {}".format(response.peer))

    def onOpen(self):
        """
        Connection from client is opened. Fires after opening
        websockets handshake has been completed and we can send
        and receive messages.

        Register client in factory, so that it is able to track it.
        Try to find conversation partner for this client.
        """
        self.factory.register(self)
        self.factory.findPartner(self)

    def connectionLost(self, reason):
        """
        Client lost connection, either disconnected or some error.
        Remove client from list of tracked connections.
        """
        self.factory.unregister(self)

    def onMessage(self, payload, isBinary):
        """
        Message sent from client, communicate this message to its conversation partner,
        """
        self.factory.communicate(self, payload, isBinary)

    def onClose(self):
        print("Connection closed")


class SpaceRaceRXFactory(WebSocketServerFactory):

    def __init__(self, *args, **kwargs):
        super(SpaceRaceRXFactory, self).__init__(*args, **kwargs)
        self.clients = {}

    def register(self, client):
        """
        Add client to list of managed connections.
        """
        self.clients[client.peer] = {"object": client, "partner": None}

    def unregister(self, client):
        """
        Remove client from list of managed connections.
        """
        self.clients.pop(client.peer)

    def findPartner(self, client):
        """
        Find chat partner for a client. Check if there any of tracked clients
        is idle. If there is no idle client just exit quietly. If there is
        available partner assign him/her to our client.
        """
        available_partners = [c for c in self.clients if c != client.peer and not self.clients[c]["partner"]]
        if not available_partners:
            print("no partners for {} check in a moment".format(client.peer))
        else:
            partner_key = random.choice(available_partners)
            self.clients[partner_key]["partner"] = client
            self.clients[client.peer]["partner"] = self.clients[partner_key]["object"]

    def communicate(self, client, payload, isBinary):
        """
        Broker message from client to its partner.
        """
        c = self.clients[client.peer]
        if not c["partner"]:
            c["object"].sendMessage("Sorry you dont have partner yet, check back in a minute".encode('utf8'), isBinary=False)
        else:
            c["partner"].sendMessage(payload, isBinary)


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
