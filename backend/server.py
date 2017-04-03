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
        # Functions for masterDict:
        # - register master
        # - unregister master
        # - register controller to master
        # - unregister controller from master
        # - create variable to map master.peer (internal use) to master.id (external use)
        #
        self.masterDict = {} # masterDict <master peer>:[controller.peer1, ..., controller.peer4]
        self.masterMap = {} # masterMap <masteruid>:<master peer> ## used to map controller to master
        self.ctrl = {} # ctrl <controller peer>:[<master peer>, <masterid>]
        self.masterid = -1

    def registerMaster(self, client):
        """
        Registering a master, if not exist:
        - generate masterid
        - create list of master.peer for 4 players (track in self.masterDict)
        - provide mapping of masterid to master.peer
        """
        if client not in self.masterDict:
            print("registered client {}".format(client.peer))
            masterid = str(self.masterid + 1).zfill(4)
            self.masterid += 1

            self.masterDict[client.peer] = [None]*4
            self.masterMap[masterid] = client.peer
            return((client.peer,masterid)) # returns peer and master id
        else:
            print("Master is already registered")
            return((None,-1))

    def unregisterMaster(self, client):
        ctrllrList = self.masterDict.pop(client.peer)
        masterid = -1
        for k in self.masterMap:
            if self.masterMap[k] == client.peer:
                masterid = self.masterMap.pop(k)
                break
        print('Removed ' + client.peer + " with id " + masterid + " from masterMap")

        # non-empty controller list

        leftCtrllr = any([x != None for x in ctrllrList])
        print("Any controllers left: " + str(leftCtrllr))
        if leftCtrllr:
            ## remove left over controllers first
            pass

        return((client.peer, masterid))

    def registerController(self, client, masterid):
        """
        Registering a controller requires a master to exists, which it is assigned to.
        This requires checks: 1) does master exist, if so 2) is it free
        if checks passed:
            1) identify master
            2) register controller to master
                - Add controller to the smallest slot (built-in index(a) returns SMALLEST index of a)
            3) register master to controller
        """
        masteroccupied = self.checkMaster(masterid)
        if masteroccupied:
            print("No master for controller " + client.peer + " available")
            if masteroccupied == 1:
                print('--- due to missing master')
            if masteroccupied == 2:
                print('--- due to max number players reached')
            return((None, -1))

        if client not in self.masterDict:
            print("registered client {}".format(client.peer))
            # add controller to smallest available slot
            masterpeer = self.masterMap[masterid]
            l1 = self.masterDict[masterpeer]
            i1 = l1.index(None) # return first index of empty player slot

            self.masterDict[masterpeer][i1] = client.peer
            self.ctrl[client.peer] = [masterpeer, masterid]
        return((client.peer, self.ctrl[client.peer][1])) # return peer and master uid

    def checkMaster(self, masterid):
        if not masterid in self.masterMap: ## master id must exist
            return 1
        n = [1 for x in self.masterDict[self.masterMap[masterid]] if x == None]

        if sum(n) < 1: ## no slots free
            return 2

        return 0

    def unregisterController(self, client):
        masterpeer, masterid = self.ctrl[client.peer]
        clientcheck = (client.peer in self.masterDict[masterpeer])
        if not clientcheck:
            print('Client not assigned to master - where is it?')
        clientpeer = self.ctrl.pop(client.peer)
        masterpeer = self.masterMap.pop(masterid)
        print('Client removed from master ' + masterid)
        return((clientpeer, masterpeer))

    def unregister(self, client):
        """
        Remove client from list of managed connections.
        """
        if client.peer in self.masterDict and client.peer in self.ctrl:
            print("Something went wrong in unregistering, since client peer is found in"+ \
            "master and ctrl dict")
            return(1)

        if client.peer in self.masterDict:
            self.unregisterMaster(client)
        if client.peer in self.ctrl:
            self.unregisterController(client)

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
                    masterpeer, masterid = self.factory.registerMaster(self)
                    print("Master " + masterpeer + " registered with id " + masterid)
                    self.sendMessage2("<logingranted>:master:"+ str(masterid))

                elif c[1] == 'controller':
                    print('Registering controller for master ' + c[2])
                    controllerpeer, masterid = self.factory.registerController(self, c[2])
                    if not controllerpeer == None:
                        self.sendMessage2("<logingranted>:controller:master" +c[2])
                    else:
                        self.sendMessage2('<logingranted>:false')
            else:
                print('Command not recognized')
                self.sendMessage2("login denied")
                self.close()

    def onConnect(self, request):
        print("Connected to Server: {}".format(request.peer))
        print("Assigned masters:")
        print(self.factory.masterDict)

    def connectionLost(self, reason):
        self.factory.unregister(self)
        print("Assigned masters:")
        print(self.factory.masterDict)

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
