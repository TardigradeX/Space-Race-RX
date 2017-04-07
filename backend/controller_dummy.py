import sys
from Commands import Commands, Targets, Defaults

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
        d = Defaults.DELIMETER
        e = Defaults.TARGET_DELIMETER
        # loginrequest = u"login|master|" + roomid
        loginrequest = Commands.LOGIN + d + \
                        Targets.MASTER + e + roomid + e + Defaults.NONE + d + \
                     "Hi There"
        print("Sending:", loginrequest)
        self.sendMessage(loginrequest.encode('utf8'), False)

    def onConnect(self, response):
        print("Server connected: {0}".format(response.peer))

    def onOpen(self):
        print("WebSocket connection open.")
        # ui = input(u'Enter room id here:\n')
        roomid = self.factory.roomid
        self.sendLogin(self, roomid)

        """ <cmd> | targetType:roomid:none |<payload> """
        d = Defaults.DELIMETER
        e = Defaults.TARGET_DELIMETER
        msg = Commands.MESSAGE + d + \
        Targets.MASTER + e + roomid + e + Defaults.NONE + d + \
            "Whats up?"
        print(msg)
        self.sendMessage(msg.encode('utf8'), isBinary = False)

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
