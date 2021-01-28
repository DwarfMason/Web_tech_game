const Phaser = require("phaser");

const Scenes = require("./src/scenes");

loadFont("AvenuePixel", "assets/fonts/AvenuePixel-Regular.ttf");

let config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    backgroundColor: 0,
    parent: "container",
    dom: {
        createContainer: true
    },
    scene: [
        Scenes.Connect,
        Scenes.MainMenu,
        Scenes.Lobby,
        Scenes.Game,
        Scenes.GameUI,
        Scenes.GameOver],
    pixelArt: true,
};

let game = new Phaser.Game(config);