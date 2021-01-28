const {CELL_SIZE} = require("../entities/MapCell");

const Phaser = require("phaser");

class PlayerCellFactory {
    constructor(config) {
        this.config = config;
    }

    spawnPlayers(players) {
        let scene = this.config.scene;
        let textures = this.config.playerTextures;

        let result = {};

        let playersByPos = {};

        for (let p of players) {
            if (p.posX === 0 && p.posY === 0) {
                continue;
            }
            let key = p.posX + " " + p.posY;
            if (playersByPos.hasOwnProperty(key)) {
                playersByPos[key].push(p);
            } else {
                playersByPos[key] = [p];
            }
        }

        for (let k of Object.keys(playersByPos)) {
            let ps = playersByPos[k];
            if (ps.length > 1) {
                let sprites = [];
                for (let p of ps) {
                    let sprite = new Phaser.GameObjects.Sprite(
                        scene,
                        CELL_SIZE * p.posX,
                        CELL_SIZE * p.posY,
                        textures[p.color]).setOrigin(0);
                    sprite.setScale(CELL_SIZE / sprite.width / 2, CELL_SIZE / sprite.height / 2);

                    sprite.x += (CELL_SIZE / 2) * Math.floor(sprites.length % 2);
                    sprite.y += (CELL_SIZE / 2) * Math.floor(sprites.length / 2);

                    sprites.push(sprite);
                    result[p.color] = sprite;
                    scene.add.existing(sprite);
                    scene.sys.updateList.add(sprite);
                    scene.sys.displayList.add(sprite);
                }
            } else {
                let sprite = new Phaser.GameObjects.Sprite(
                    scene,
                    CELL_SIZE * ps[0].posX,
                    CELL_SIZE * ps[0].posY,
                    textures[ps[0].color]).setOrigin(0);
                sprite.setScale(CELL_SIZE / sprite.width, CELL_SIZE / sprite.height);
                result[ps[0].color] = sprite;
                scene.add.existing(sprite);
                scene.sys.updateList.add(sprite);
                scene.sys.displayList.add(sprite);
            }
        }
        return result;
    }
}

module.exports = PlayerCellFactory;