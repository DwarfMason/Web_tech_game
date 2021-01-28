const Phaser = require("phaser");
const GameManager = require("../GameManager");
const {PlayerType, CELL_SIZE} = require("../entities/MapCell");

class GameOverScene extends Phaser.Scene {
    constructor() {
        super("GameOver");
        this.playerColor = -1;
        this.winners = [];
        this.playerTextures = {};

        this.playerTextures[PlayerType.PLAYER_1] = "rat1";
        this.playerTextures[PlayerType.PLAYER_2] = "rat2";
        this.playerTextures[PlayerType.PLAYER_3] = "rat3";
        this.playerTextures[PlayerType.PLAYER_4] = "rat4";
    }

    init(data) {
        this.playerColor = -1;
        this.winners = [];
        this.spectator = data.spectator ?? false;
        if (!this.spectator) {
            this.playerColor = data.currentPlayerColor;
        }
        for (let winner of data.playersWon) {
            this.winners.push(winner.color);
        }
    }

    preload() {
        this.load.image('bg', 'assets/images/bg.png');
        this.load.image("rat1", "assets/images/tileset_rat1.png");
        this.load.image("rat2", "assets/images/tileset_rat2.png");
        this.load.image("rat3", "assets/images/tileset_rat3.png");
        this.load.image("rat4", "assets/images/tileset_rat4.png");

        this.load.scenePlugin({
            key: 'rexuiplugin',
            url: 'node_modules/phaser3-rex-plugins/dist/rexuiplugin.min.js',
            sceneKey: 'rexUI'
        });
        this.load.plugin('rextexteditplugin', 'node_modules/phaser3-rex-plugins/dist/rextexteditplugin.min.js', true);

        this.load.audio("win", "assets/sounds/win.wav");
        this.load.audio("lose", "assets/sounds/lose.wav");

    }

    createButton(x, y, texture, label, onClick) {
        let button = this.add.sprite(x, y, texture).setOrigin(0.5, 0.5);
        let labelObject = this.add.text(x, y, label, {
            fontFamily: "AvenuePixel",
            fontSize: button.height * 0.5 + "px"
        }).setOrigin(0.5, 0.5);

        let scale = Math.max(0.5, labelObject.width / (button.width) + 0.1);
        button.setScale(scale, 0.5);

        let snd = this.sound.add("press");
        button.setInteractive().on('pointerup', () => {
            snd.play();
            onClick();
        });

        return button;
    }

    create() {
        this.add.sprite(0, 0, "bg").setOrigin(0, 0);
        const gameOverTitle = this.add.text(512, 0, "Game over", {
            fontFamily: "AvenuePixel",
            fontSize: "40px"
        }).setOrigin(0.5, 0);

        const ratOffset = 10;
        const ratsWidth = (CELL_SIZE + ratOffset) * this.winners.length - ratOffset;
        const startX = 512 - ratsWidth / 2;
        const winnersY = 320;

        let isWin = false;
        for (let i = 0; i < this.winners.length; ++i) {
            const col = this.winners[i];
            if (!this.spectator && col === this.playerColor) {
                isWin = true;
            }
            let sprite = this.add.sprite(
                startX + i * (CELL_SIZE + ratOffset),
                winnersY,
                this.playerTextures[col]
            ).setOrigin(0);

            sprite.setScale(CELL_SIZE / sprite.width, CELL_SIZE / sprite.height);
        }

        let state = (isWin || this.spectator) ? "win" : "lose"
        if (!this.spectator) {
            gameOverTitle.setText("You " + state);
        }
        let snd = this.sound.add(state);
        snd.play();

        this.createButton(512, 600, "button", "Back", () => {
            let em = GameManager.eventEmitter;
            em.once("ServerConnected", () => {
                GameManager.eventEmitter.removeAllListeners();
                this.scene.start("MainMenu");
            });

            GameManager.socket.send({type: "LeaveLobby"});
        });
    }
}

module.exports = GameOverScene;