const {CELL_SIZE, CellType} = require("../entities/MapCell");

const Phaser = require("phaser");

class MapCellFactory {
    constructor(config) {
        this.config = config;
    }

    newCell(type, [posX, posY]) {
        let scene = this.config.scene;
        let textures = this.config.cellTextures;

        let ret = new Phaser.GameObjects.Sprite(
            scene,
            CELL_SIZE * posX,
            CELL_SIZE * posY,
            textures[type] ?? textures[CellType.FLOOR]).setOrigin(0);
        ret.setScale(CELL_SIZE / ret.width, CELL_SIZE / ret.height);

        scene.add.existing(ret);
        scene.sys.updateList.add(ret);
        scene.sys.displayList.add(ret);
        return ret;
    }
}

module.exports = MapCellFactory;