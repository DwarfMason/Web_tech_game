const Phaser = require("phaser");
const GameManager = require("../GameManager");
const {CellType, PlayerType, CELL_SIZE} = require("../entities/MapCell");
const MapCellFactory = require("../factories/MapCellFactory");
const PlayerCellFactory = require("../factories/PlayerCellFactory");

class GameScene extends Phaser.Scene {
    constructor() {
        super("Game");

        this.turnId = 0;
        this.timer = 5500; // in ms
        this.map = [];
        this.players = {};
        this.playerData = {};
        let config = {
            scene: this,
            cellTextures: {},
            playerTextures: {},
        }
        config.cellTextures[CellType.INVISIBLE] = "empty";
        config.cellTextures[CellType.WALL] = "wall";
        config.cellTextures[CellType.FLOOR] = "floor";
        config.cellTextures[CellType.EXIT] = "exit";

        config.playerTextures[PlayerType.PLAYER_1] = "rat1";
        config.playerTextures[PlayerType.PLAYER_2] = "rat2";
        config.playerTextures[PlayerType.PLAYER_3] = "rat3";
        config.playerTextures[PlayerType.PLAYER_4] = "rat4";

        this.mapCellFactory = new MapCellFactory(config);
        this.playerCellFactory = new PlayerCellFactory(config);
    }

    init(data) {
        this.mapWidth = data.mapWidth;
        this.mapHeight = data.mapHeight;
        this.map = Array.from(Array(this.mapHeight), () => new Array(this.mapWidth));
        this.lobbyNo = data.lobbyNo;

        this.currentPlayerColor = data.player.color;
        this.playerData[data.player.color] = {x: data.player.x, y: data.player.y};
        this.visibleCells = data.visibleCells;
    }

    preload() {
        this.load.audio("walk", "assets/sounds/walk.wav");

        this.load.image("empty", "assets/images/tileset_unknown.png");
        this.load.image("wall", "assets/images/tileset_wall.png");
        this.load.image("floor", "assets/images/tileset_floor.png");
        this.load.image("exit", "assets/images/tileset_exit.png");

        this.load.image("rat1", "assets/images/tileset_rat1.png");
        this.load.image("rat2", "assets/images/tileset_rat2.png");
        this.load.image("rat3", "assets/images/tileset_rat3.png");
        this.load.image("rat4", "assets/images/tileset_rat4.png");
    }

    redrawVisibleArea() {
        // TODO fog of war?
        this.visibleCells.center = CellType.FLOOR;
        let {x,y} = this.playerData[this.currentPlayerColor];
        const offsets = {
            "center": {x:0,y:0},
            "left": {x:-1,y:0},
            "right": {x:1,y:0},
            "up": {x:0,y:-1},
            "down": {x:0,y:1},
        }

        for (let pos of Object.keys(offsets)) {
            let o = offsets[pos];
            if (this.map[y+o.y][x+o.x].texture.key === "empty") {
                this.map[y+o.y][x+o.x].destroy();
                this.map[y+o.y][x+o.x] = this.mapCellFactory.newCell(
                    this.visibleCells[pos], [x+o.x, y+o.y]);
            }
        }

        for (let p of Object.keys(this.players)) {
            this.players[p].destroy();
        }

        let playersArr = [];
        for (let p of Object.keys(this.playerData)) {
            let ppp = this.playerData[p];
            playersArr.push({color: p, posX: ppp.x, posY: ppp.y});
        }
        this.players = this.playerCellFactory.spawnPlayers(playersArr);

        let pp = this.playerData[this.currentPlayerColor];
        this.cam.centerOn(pp.x * CELL_SIZE, pp.y * CELL_SIZE);
    }

    create() {
        this.cam = this.cameras.add(0, 0, 1024, 768, false, "MapCamera");
        this.cam.setBounds(0, 0, CELL_SIZE * this.mapWidth, CELL_SIZE * this.mapHeight, true);
        this.cam.setZoom(0.69);

        for (let x = 0; x < this.mapWidth; ++x) {
            for (let y = 0; y < this.mapHeight; ++y) {
                let cellType = (x === 15) && (y === 15) ? CellType.EXIT : CellType.INVISIBLE;
                this.map[y][x] = this.mapCellFactory.newCell(cellType, [x, y]);
            }
        }

        this.redrawVisibleArea();

        this.walkSnd = this.sound.add("walk");

        this.input.keyboard.on('keyup', (event) => {
            let dir;
            switch (event.keyCode) {
                case 37: // left
                    dir = "Left";
                    break;
                case 39: // right
                    dir = "Right";
                    break;
                case 38: // up
                    dir = "Up";
                    break;
                case 40: // down
                    dir = "Down";
                    break;
                default:
                    return;
            }
            GameManager.socket.send({type: "Move" + dir, turnId: this.turnId});
            this.walkSnd.play();
        });

        this.scene.launch("GameUI");

        GameManager.eventEmitter.on("NewTurn", data => {
            this.turnId = data.turnId + 1;
            this.timer = 5500;
            this.playerData = {};
            this.playerData[this.currentPlayerColor] = {x: data.playerPosX, y: data.playerPosY};
            this.visibleCells = data.visibleCells;

            for (let k of Object.keys(data.rivals)) {
                let z = data.rivals[k];
                this.playerData[k] = {x: z.posX, y: z.posY};
            }
            this.redrawVisibleArea();
        }).on("WrongTurnId", data => {
            console.warn("We're getting a bit late...");
            this.turnId = data.turnId;
        }).once("GameOver", data => {
            GameManager.eventEmitter.removeAllListeners();
            this.input.keyboard.removeAllListeners();
            this.scene.stop("GameUI");

            this.scene.start("GameOver", {
                currentPlayerColor: this.currentPlayerColor,
                playersWon: data.playersWon,
            });
        });
    }

    update(time, delta) {
        this.timer -= delta;
        this.timer = Phaser.Math.Clamp(this.timer, 0, 5500);
    }
}

class GameUIScene extends Phaser.Scene {
    constructor() {
        super("GameUI");
        console.log("GameUI created!");
    }

    preload() {
    }

    create() {
        this.gameScene = this.scene.get("Game");
        this.turnIdText = this.add.text(8, 760, `Turn #${this.gameScene.turnId}`, {
            fontFamily: "AvenuePixel",
            fontSize: "36px"
        }).setOrigin(0, 1);
        this.turnIdText.setShadow(1, 1, '#000000', 2);

        this.lobbyNoText = this.add.text(1016, 8, `Lobby ${this.gameScene.lobbyNo}`, {
            fontFamily: "AvenuePixel",
            fontSize: "24px"
        }).setOrigin(1, 0);

        this.timerG = this.add.graphics();
    }

    update(time, delta) {
        this.turnIdText.text = `Turn #${this.gameScene.turnId}`;
        if (this.gameScene.timer) {
            let totalAngle = Phaser.Math.Clamp((this.gameScene.timer) / 5500 * 360, 0, 360);
            this.timerG.clear();
            this.timerG.lineStyle(4, 0xffffff, 0.5);
            this.timerG.beginPath();
            this.timerG.arc(992, 734, 18,
                Phaser.Math.DegToRad(-90),
                Phaser.Math.DegToRad(totalAngle-90), false);
            this.timerG.strokePath();
        }
    }

}

module.exports = {GameScene, GameUIScene};