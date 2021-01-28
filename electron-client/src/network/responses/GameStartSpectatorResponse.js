const { Response, ParsedResponse } = require("./Response");
const { CellType, PlayerType } = require("../../entities/MapCell");

class GameStartSpectatorParsedResponse extends ParsedResponse {
    constructor(payload) {
        super("GameStartSpectator", payload);
        this.width = payload.width;
        this.height = payload.height;
        this.mapCells = payload.mapCells;
        this.rivals = payload.rivals;
    }
}

class GameStartSpectatorResponse extends Response {
    constructor() {
        super();
    }

    parse(data) {
        let payload = this._innerParse(data);
        let width = +payload[1];
        let height = +payload[2];

        let map = Array.from(Array(height), () => new Array(width));

        for (let y = 0; y < height; ++y) {
            for (let x = 0; x < width; ++x) {
                map[y][x] = +payload[3 + x + height*y];
            }
        }

        let rivals = {};

        for (let i = 3 + width * height; i < payload.length; i += 3) {
            rivals[+payload[i]] = { // color
                posX: +payload[i + 1],
                posY: +payload[i + 2]
            }
        }

        let response = {
            width,
            height,
            mapCells: map,
            rivals
        }

        return new GameStartSpectatorParsedResponse(response);
    }
}

module.exports = GameStartSpectatorResponse;