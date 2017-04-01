import sys

from twisted.python import log
from twisted.internet import reactor

from autobahn.twisted.websocket import WebSocketClientProtocol, \
    WebSocketClientFactory

class MyClientFactory(WebSocketClientFactory):
    def __init__(self, *args, **kwargs):
        super(MyClientProtocol, self).__init__(*args, **kwargs)
        self.isMaster = True

    
class MyClientProtocol(WebSocketClientProtocol):
    def sendLogin(self, client):
        loginrequest = u"<loginrequest>:master"
        self.sendMessage(loginrequest.encode('utf8'), False)

    def onConnect(self, response):
        print("Server connected: {0}".format(response.peer))

    def onOpen(self):
        print("WebSocket connection open.")
        print("Requesting login")
        self.sendLogin(self)

    def onMessage(self, payload, isBinary):
        print(payload.decode('utf8'))

    def sendClose(self, code = None, reason = None):
        """self.sendClose()"""

    def onClose(self, wasClean, code, reason):
        print("WebSocket connection closed: {0}".format(reason))


if __name__ == '__main__':
    log.startLogging(sys.stdout)

    factory = WebSocketClientFactory(u"ws://127.0.0.1:9000/ws")
    factory.protocol = MyClientProtocol

    reactor.connectTCP("127.0.0.1", 9000, factory)
    reactor.run()
