const Phaser = require("phaser");
const GameManager = require("../GameManager");

class LobbyScene extends Phaser.Scene {
    constructor() {
        super("Lobby");
        console.log(`Constructor ${this.constructor.name} called!`);
    }

    init(data) {
        this.playersReady = data.playersReady ?? 14;
        this.playersTotal = data.playersTotal ?? 88;
        this.lobbyNo = data.lobbyNo ?? 0;
    }

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

        return new Phaser.GameObjects.Group(this, [button, labelObject]);
    }

    updateReadyLabel() {
        if (this.playersReadyText) {
            this.playersReadyText.text = `Ready: ${this.playersReady}/${this.playersTotal}`;
        }
    }

    create() {
        this.add.sprite(0, 0, "bg").setOrigin(0, 0);
        const connectTitle = this.add.text(512, 0, `Lobby ${this.lobbyNo}`, {
            fontFamily: "AvenuePixel",
            fontSize: "40px"
        }).setOrigin(0.5, 0);

        this.createButton(160, 90, "button", "Leave", () => {
            let em = GameManager.eventEmitter;
            em.once("ServerConnected", () => {
                GameManager.eventEmitter.removeAllListeners();
                this.scene.start("MainMenu");
            });

            GameManager.socket.send({type: "LeaveLobby"});
        });

        this.playersReadyText = this.add.text(512, 384, "Ready: 0/0", {
            fontFamily: "AvenuePixel",
            fontSize: "64px"
        }).setOrigin(0.5, 0.5);
        this.updateReadyLabel();

        this.readyBtn = this.createButton(512, 600, "button", "Ready!", () => {
            this.readyBtn.active = false;
            for (let c of this.readyBtn.getChildren()) {
                c.alpha = 0;
            }
            GameManager.socket.send({type: "NotifyReady"});
        });

        GameManager.eventEmitter.on("PlayerReady", data => {
            this.playersReady = data.playersReady;
            this.playersTotal = data.playersTotal;
            this.updateReadyLabel();
        });
        GameManager.eventEmitter.on("PlayerLeft", data => {
            this.readyBtn.active = true;
            for (let c of this.readyBtn.getChildren()) {
                c.alpha = 1;
            }
            this.playersReady = 0;
            this.playersTotal = data.playersTotal;
            this.updateReadyLabel();
        });
        GameManager.eventEmitter.once("GameStart", data => {
            this.readyBtn.active = true;
            for (let c of this.readyBtn.getChildren()) {
                c.alpha = 1;
            }
            this.readyBtn.alpha = 1;
            GameManager.eventEmitter.removeAllListeners();

            let sceneParams = {
                player: {
                    color: data.playerColor,
                    x: data.playerPosX,
                    y: data.playerPosY,
                },
                mapWidth: data.mapSizeWidth,
                mapHeight: data.mapSizeHeight,
                visibleCells: data.visibleCells,
                lobbyNo: this.lobbyNo,
            }
            this.scene.start("Game", sceneParams);
        });
    }

    update(time, delta) {
    }
}

module.exports = LobbyScene;