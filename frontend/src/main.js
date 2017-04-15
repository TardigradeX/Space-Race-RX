import 'pixi'
import 'p2'
import Phaser from 'phaser'

import BootState from './states/Boot'
import SplashState from './states/Splash'
import GameState from './states/Game'
import GameOverState from './states/GameOver'
import DummyDecide from './states/DummyDecide'
import Lobby from './states/Lobby'
import GamePad from './states/GamePad'
import GamePadLobby from "./states/GamePadLobby";
import GameFinished from "./states/GameFinished";

import config from './config'


class Game extends Phaser.Game {
  constructor () {
    const docElement = document.documentElement;
    const width = docElement.clientWidth > config.gameWidth ? config.gameWidth : docElement.clientWidth;
    const height = docElement.clientHeight > config.gameHeight ? config.gameHeight : docElement.clientHeight;

    super(width, height, Phaser.CANVAS, 'content', null)

    this.state.add('Boot', BootState, false)
    this.state.add('Splash', SplashState, false)
    this.state.add('Game', GameState, false)
    this.state.add('GameOver', GameOverState, false);
    this.state.add('DummyDecide', DummyDecide, false);
    this.state.add('Lobby', Lobby, false);
    this.state.add('GamePad', GamePad, false);
    this.state.add('GamePadLobby', GamePadLobby, false);
    this.state.add('GameFinished', GameFinished, false);
    this.state.start('Boot')

  }
}

window.game = new Game()
