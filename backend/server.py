import sys
import re
import json

from Commands import Commands, Targets , Defaults, Payloads
import Commands_util as cutil

from RoomService import RoomService
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

        self.requestopt = {}
        self.requestopt['listRooms'] = self.listRooms

        self.roomService = RoomService()

    def addNewClient(self, peer):
        self.roomService.addNewClient(peer)

    def addRoom(self, client):
        roomid = self.roomService.addRoom(client)
        return(roomid)

    def registerController(self, client, roomid):
        (success, playerId) = self.roomService.addUser(client, roomid)
        return success, playerId

    def unregisterClient(self, peer):
        """
        use recursive function to unregister client
        onClose() of client triggers unregister
        case1: client is room, sendClose for controllers, remove room
        case2: client is controller, remove controller
        """
        success, userList = self.roomService.deleteClient(peer)
        rooms = self.roomService.listRoomObjects()
        print(rooms)
        for key in rooms:
            print(key, rooms[key].getAllUser())
        print("Unregistered", peer + ": worked", success,", userList:", userList)

    def passMessage(self, sourcepeer, target, payload):
        self.roomService.passMessage(sourcepeer, target, payload)

    def passControl(self, sourcepeer, cmd):
        self.roomService.controllSpaceship(sourcepeer, cmd)

    def parseRequest(self, source, targetType, roomid, playerId, payload):
        """ should always return a json file """
        res = None
        print(source, 'requested', payload, 'from', targetType, 'at room', roomid, playerId)
        if payload in self.requestopt:
            res = self.requestopt[payload]()
            res = json.dumps(res, ensure_ascii = False)
        return(res)

    def listRooms(self):
        """returns list of roomid + #players"""
        return(self.roomService.listRooms())

class SpaceRaceRXProtocol(WebSocketServerProtocol):

    def sendMessage2(self, payload):
        self.sendMessage(payload.encode('utf8'), False)

    def parseMessage(self, payload):
        pattern = re.compile('.+\|.+\|.+')
        isCmd = bool(pattern.search(payload))
        if not isCmd:
            print("Not a command")
            return(None)
        """
            Commands are standardized. CommandsFactory.py helps creating
            commands
            Format:
            <cmd>|<target>|<payload>
            - <cmd> being defined in Commands.py/Commands.js
            - <target> := <targetType>:<roomid>:<playerId>
            - <payload> any content
        """
        print(payload)
        cmd, target, payload = payload.split(Defaults.DELIMETER)
        targetType, roomid, playerId = target.split(Defaults.TARGET_DELIMETER)

        """CREATING A DICT OUT OF THE COMMANDS MAY IMPROVE CMD IDENTIFICATION"""
        if cmd == Commands.LOGIN:
            if roomid == Defaults.NONE:
                newRoomid = self.factory.addRoom(self)
                msg = cutil.createLoginResponse(\
                                Targets.MASTER, newRoomid, Defaults.NONE)
                print(msg)
                self.sendMessage2(msg)
            else:
                success, playerId = self.factory.registerController(self, roomid)
                if not success:
                    self.sendMessage2("Could not sign up to room "+ str(roomid))
                    self.sendClose()
                else:
                    # Send response to 1) controller (self) and 2) master
                    msg = cutil.createLoginResponse(Targets.CONTROLLER, roomid, playerId)
                    self.sendMessage2(msg)
                    msg = cutil.createPlayerJoined(roomid, playerId)
                    self.factory.roomService.passMessageToMaster(self.peer, msg)
                    print("Controller " + self.peer + " registered to room" + roomid)

        elif cmd == Commands.MESSAGE:
            sourcepeer = self.peer
            cTarget = target
            cPayload = payload
            self.factory.passMessage(sourcepeer, cTarget, cPayload)

        elif cmd == Commands.REQUEST:
            res = self.factory.parseRequest(self.peer, targetType, roomid, playerId, payload)
            msg = cutil.createAnswer(Defaults.NONE, Defaults.NONE, Defaults.NONE, Payloads.LISTROOMS)
            msg = msg + Defaults.TARGET_DELIMETER + res
            print("Sending message:\n", msg)
            self.sendMessage2(msg)

        elif cmd == Commands.LOGOUT:
            print("[not implemented] " + self.peer + "sent a logout ")
            pass

        elif cmd == Commands.LEFTROLL:
            self.factory.passControl(self.peer, Commands.LEFTROLL)

        elif cmd == Commands.RIGHTROLL:
            self.factory.passControl(self.peer, Commands.RIGHTROLL)

        elif cmd == Commands.THRUST:
            self.factory.passControl(self.peer, Commands.THRUST)

        elif cmd == Commands.NONE:
            self.factory.passControl(self.peer, Commands.NONE)

        else:
            print(payload)
            print("Unknown command - unable to comply")

    def onConnect(self, request):
        # request can be parsed to JSON object!
        print("Connected to Server: {}".format(request.peer))
        # how to identify whether request is master or client?
        self.factory.addNewClient(request.peer)

    def onMessage(self, payload, isBinary):
        pay1 = payload.decode('utf8')
        print(">>>", self.peer + ": " + pay1) # which peer?
        self.parseMessage(pay1)
        print("")

    def onClose(self, wasClean, code, reason):
        print("Protocol-level closing", self.peer)
        if not wasClean:
            print(code, reason)
        self.factory.unregisterClient(self.peer)


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
