from enum import Enum

# commands are in the form of
# <cmd>:<target>:<payload>
# regexp for recognition: '.+|.+|.+'
class Commands(str, Enum):
    LOGINMASTER = "loginmaster"
    LOGINCONTROLLER = "login"
    LOGOUT = 'logout'
    SIGNUP = 'signup'
    MESSAGE = 'message'

    LEFTROLL = "left"
    RIGHTROLL = "right"
    THRUST = "thrust"

class Targets(str, Enum):
    PLAYER = 'player'
    PLAYER1 = "player1"
    PLAYER2 = "player2"
    PLAYER3 = "player3"
    PLAYER4 = "player4"
    MASTER = "master"
    SERVER = "server"

class Default(str, Enum):
    NONE = 'none'
