import sys

from twisted.python import log
from twisted.internet import reactor, defer

from autobahn.twisted.websocket import WebSocketClientProtocol, \
    WebSocketClientFactory

class MyClientFactory(WebSocketClientFactory):
    def __init__(self, *args, **kwargs):
        super(MyClientProtocol, self).__init__(*args, **kwargs)
        self.isMaster = True


class MyClientProtocol(WebSocketClientProtocol):
    def sendLogin(self):
        d = defer.Deferred()
        def loginGranted(result):
            print('>>Login granted')

        def loginDenied(result):
            print('>>Login denied')

        d.addCallback(loginGranted)
        d.addErrback(loginDenied)
        loginrequest = u"loginmaster|target|master"
        d.callback(self.sendMessage(loginrequest.encode('utf8'), False))
        return d

    def onConnect(self, response):
        print("Server connected: {0}".format(response.peer))
        print("Requesting login")
        d = self.sendLogin()
        # d = defer.Deferred()
        # # lambda x: x == i or x % i
        # d.addCallback(lambda x: ">> "+ str(x))
        # d.addErrback(lambda x: ">> Error "+ str(x))
        # d.callback(self.sendLogin())

    def onOpen(self):
        print("WebSocket connection open.")

    def onMessage(self, payload, isBinary):
        print(payload.decode('utf8'))

if __name__ == '__main__':
    log.startLogging(sys.stdout)

    factory = WebSocketClientFactory(u"ws://127.0.0.1:9000/ws")
    factory.protocol = MyClientProtocol

    reactor.connectTCP("127.0.0.1", 9000, factory)
    reactor.run()
