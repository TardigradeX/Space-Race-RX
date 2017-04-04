from enum import Enum

# commands are in the form of
# <cmd>:<target>:<payload>
# regexp for recognition: '.+|.+|.+'
class Commands(str, Enum):
    LOGINMASTER = "loginmaster"
    LOGINCONTROLLER = "login"
    LOGOUT = 'logout'

    LEFTROLL = "left"
    RIGHTROLL = "right"
    THRUST = "thrust"
