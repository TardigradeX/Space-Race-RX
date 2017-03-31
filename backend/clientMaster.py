from autobahn.twisted.websocket import WebSocketClientProtocol, \
    WebSocketClientFactory

class ClientMasterProtocol(WebSocketClientProtocol):
    def onConnect(self):
        print("Master connected")

    def onOpen(self):
        pass

    def onMessage(self, payload, isBinary):
        pass

    def onClose(self, wasClean, code, reason):
        pass

if __name__ == '__main__':

    import sys

    from twisted.python import log
    from twisted.internet import reactor

    log.startLogging(sys.stdout)

    factory = WebSocketClientFactory(u"ws://127.0.0.1:9000/ws")
    factory.protocol = ClientControllerProtocol

    reactor.connectTCP("127.0.0.1", 9000, factory)
    reactor.run()
