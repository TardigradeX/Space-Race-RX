import sys

from twisted.python import log
from twisted.internet import reactor

from autobahn.twisted.websocket import WebSocketClientProtocol, \
    WebSocketClientFactory

class MyClientFactory(WebSocketClientFactory):

    def __init__(self, *args, **kwargs):
        print(kwargs)
        roomid = kwargs.pop('roomid')
        print(roomid)

        super(MyClientFactory, self).__init__(*args, **kwargs)
        self.isMaster = False
        self.roomid = roomid

class MyClientProtocol(WebSocketClientProtocol):

    def sendLogin(self, client, roomid):
        loginrequest = u"login|Server|"+roomid
        self.sendMessage(loginrequest.encode('utf8'), False)

    def onConnect(self, response):
        print("Server connected: {0}".format(response.peer))

    def onOpen(self):
        print("WebSocket connection open.")
        # ui = input(u'Enter room id here:\n')
        roomid = self.factory.roomid
        self.sendLogin(self, roomid)

        self.sendMessage(("message|master|Whats up?").encode('utf8'), isBinary = False)

        # check if login granted

    def onMessage(self, payload, isBinary):
        print(payload.decode('utf8'))

    def onClose(self, wasClean, code, reason):
        self.sendMessage(('logout|'+self.factory.roomid+'|goodbye from controller').encode('utf8'), isBinary = True)
        print("WebSocket connection closed: {0}".format(reason))

if __name__ == '__main__':
    roomid = sys.argv[1]

    log.startLogging(sys.stdout)

    factory = MyClientFactory(u"ws://127.0.0.1:9000/ws", roomid = roomid)
    factory.protocol = MyClientProtocol

    reactor.connectTCP("127.0.0.1", 9000, factory)
    reactor.run()
