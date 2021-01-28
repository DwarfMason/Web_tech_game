const Connect = require("./ConnectScene");
const MainMenu = require("./MainMenuScene");
const Lobby = require("./LobbyScene");
const {GameScene, GameUIScene} = require("./GameScene");
const GameOver = require("./GameOverScene");

module.exports = {
    Connect,
    MainMenu,
    Lobby,
    Game: GameScene,
    GameUI: GameUIScene,
    GameOver
}