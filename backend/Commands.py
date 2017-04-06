from enum import Enum

# commands are in the form of
# <cmd>:<target>:<payload>
# regexp for recognition: '.+|.+|.+'
class Commands(str, Enum):
    LOGIN = 'login'
    LOGOUT = 'logout'
    SIGNUP = 'signup'
    MESSAGE = 'message'

    LEFTROLL = "left"
    RIGHTROLL = "right"
    THRUST = "thrust"

class Targets(str, Enum):
    CONTROLLER = 'controller'
    CONTROLLER1 = "controller1"
    CONTROLLER2 = "controller2"
    CONTROLLER3 = "controller3"
    CONTROLLER4 = "controller4"
    MASTER = "master"
    SERVER = "server"
    PLAYER = "player"

class Default(str, Enum):
    NONE = 'none'
    DELIMETER = '|'
    TARGET_DELIMETER = ':'
