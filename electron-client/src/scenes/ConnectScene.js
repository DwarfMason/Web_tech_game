const EventEmitter = require("events").EventEmitter;
const Phaser = require("phaser");
const GameManager = require("../GameManager");
const GameSocket = require("../network");

class ConnectScene extends Phaser.Scene {
    constructor() {
        super("Connect");
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

        this.load.audio("press", "assets/sounds/press.wav");
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
        const connectTitle = this.add.text(512, 0, "Connect to the server", {
            fontFamily: "AvenuePixel",
            fontSize: "40px"
        }).setOrigin(0.5, 0);

        this.hostnameText = this.createTextField(352, 300, 190, 36, {
            defaultText: "localhost",
            type: "text"
        });
        this.portText = this.createTextField(562, 300, 100, 36, {
            defaultText: "2020",
            type: "number"
        });

        this.statusText = this.add.text(512, 700, "", {
            fontFamily: "AvenuePixel",
            fontSize: "40px"
        }).setOrigin(0.5, 0.5);

        let connectBtn = this.createButton(512, 500, "button", "Connect", () => {
            this.statusText.text = "Connecting...";

            GameManager.eventEmitter = new EventEmitter();
            GameManager.socket = new GameSocket(this.hostnameText.text, +this.portText.text, GameManager.eventEmitter);
            let e = GameManager.eventEmitter;

            e.once('ServerConnected', () => {
                console.log("Connected!");
                this.statusText.text = "";
                GameManager.eventEmitter.removeAllListeners();
                this.scene.start("MainMenu");
            });

            e.once("error", (e) => {
                console.error(e);
                this.statusText.text = "Failed to connect.";
            });

            GameManager.socket.connect();
        });
    }

    update(time, delta) {
    }
}

module.exports = ConnectScene;