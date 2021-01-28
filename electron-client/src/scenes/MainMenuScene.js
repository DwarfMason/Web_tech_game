const Phaser = require("phaser");
const GameManager = require("../GameManager");

class MainMenuScene extends Phaser.Scene {
    constructor() {
        super("MainMenu");
        console.log(`Constructor ${this.constructor.name} called!`);
    }

    // init(data) {
    // }

    preload() {
        this.load.image('button', 'assets/images/buttons_green_btn.png');
        this.load.image('bg', 'assets/images/bg.png');

        this.load.scenePlugin({
            key: 'rexuiplugin',
            url: 'node_modules/phaser3-rex-plugins/dist/rexuiplugin.min.js',
            sceneKey: 'rexUI'
        });
        this.load.plugin('rextexteditplugin', 'node_modules/phaser3-rex-plugins/dist/rextexteditplugin.min.js', true);
    }

    createTextField(posX, posY, width, height, params) {
        if (params === undefined) params = {
            defaultText: "",
            type: "text"
        }
        let g = this.add.graphics();
        g.lineStyle(1, 0xffffff, 1);
        g.strokeRect(posX - 1, posY - 1, width + 2, height + 2);

        const text = this.add.text(posX, posY, params.defaultText, {
            fixedWidth: width,
            fixedHeight: height,
            fontFamily: "AvenuePixel",
            fontSize: height + "px"
        });

        text.setInteractive().on('pointerdown', () => {
            this.rexUI.edit(text, {
                type: params.type
            });
        });

        return text;
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
        const connectTitle = this.add.text(512, 0, "Main menu", {
            fontFamily: "AvenuePixel",
            fontSize: "40px"
        }).setOrigin(0.5, 0);


        this.createButton(512, 200, "button", "Create lobby", () => {
            let em = GameManager.eventEmitter;
            em.once("LobbyCreated", (data) => {
                GameManager.eventEmitter.removeAllListeners();
                this.scene.start("Lobby", {
                    playersReady: 0,
                    playersTotal: 1,
                    lobbyNo: data.sessionId
                });
            });

            GameManager.socket.send({type: "CreateLobby"});
        });

        let delim = this.add.graphics();
        delim.lineStyle(1, 0xffffff, 1);
        delim.strokeRect(40, 324, 944, 1);

        let __offset = 390;
        let lobbyIdLabel = this.add.text(__offset, 420, "Lobby ID:", {
            fontFamily: "AvenuePixel",
            fontSize: "40px"
        });

        this.lobbyIdText = this.createTextField(__offset + 120, 420, 100, 40, {
            type: "number",
            defaultText: "0"
        });

        this.joinStatusText = this.add.text(512, 480, "", {
            fontFamily: "AvenuePixel",
            fontSize: "40px"
        }).setOrigin(0.5, 0);

        this.createButton(512, 600, "button", "Join lobby", () => {
            let lobbyNo = +this.lobbyIdText.text;
            this.joinStatusText.text = "";

            let em = GameManager.eventEmitter;
            em.once("LobbyNotExist", () => {
                this.joinStatusText.text = "This lobby does not exist.";
                GameManager.eventEmitter.removeAllListeners();
            });
            em.once("LobbyFull", () => {
                this.joinStatusText.text = "This lobby is full.";
                GameManager.eventEmitter.removeAllListeners();
            });
            em.once("PlayerReady", data => {
                this.joinStatusText.text = "";
                GameManager.eventEmitter.removeAllListeners();
                this.scene.start("Lobby", {
                    playersReady: data.playersReady,
                    playersTotal: data.playersTotal,
                    lobbyNo
                });
            });

            GameManager.socket.send({type: "JoinLobby", sessionId: lobbyNo});
        });

        this.createButton(512, 700, "button", "Spectate", () => {
            let lobbyNo = +this.lobbyIdText.text;
            this.joinStatusText.text = "";

            let em = GameManager.eventEmitter;
            em.once("LobbyNotExist", () => {
                this.joinStatusText.text = "This lobby does not exist.";
                GameManager.eventEmitter.removeAllListeners();
            });
            em.once("GameNotYetStarted", () => {
                this.joinStatusText.text = "This lobby has not started game yet.";
                GameManager.eventEmitter.removeAllListeners();
            });
            em.once("GameStartSpectator", data => {
                this.joinStatusText.text = "";
                GameManager.eventEmitter.removeAllListeners();
                this.scene.start("Game", {
                    spectator: true,
                    mapWidth: data.width,
                    mapHeight: data.height,
                    mapCells: data.mapCells,
                    rivals: data.rivals,
                    lobbyNo
                });
            });

            GameManager.socket.send({type: "JoinLobbySpectator", sessionId: lobbyNo});
        });
    }

    update(time, delta) {
    }
}

module.exports = MainMenuScene;