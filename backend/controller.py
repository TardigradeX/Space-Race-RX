import sys

from twisted.python import log
from twisted.internet import reactor

from autobahn.twisted.websocket import WebSocketClientProtocol, \
    WebSocketClientFactory

class MyClientFactory(WebSocketClientFactory):

    roomid = None

    def __init__(self, *args, **kwargs):
        super(MyClientProtocol, self).__init__(*args, **kwargs)
        self.isMaster = False
        self.roomid = None

class MyClientProtocol(WebSocketClientProtocol):

    def sendLogin(self, client, roomid):
        loginrequest = u"<loginrequest>:controller:"+roomid
        self.sendMessage(loginrequest.encode('utf8'), False)

    def onConnect(self, response):
        print("Server connected: {0}".format(response.peer))

    def onOpen(self):
        print("WebSocket connection open.")
        ui = input(u'Enter room id here:\n')
        granted = False
        while not granted
            self.sendLogin(self, ui)


        # check if login granted

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
