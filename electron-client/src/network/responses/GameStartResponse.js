const { Response, ParsedResponse } = require("./Response");
const { CellType, PlayerType } = require("../../entities/MapCell");

class GameStartParsedResponse extends ParsedResponse {
    constructor(payload) {
        super("GameStart", payload);
        if (!this.error) {
            this.playerColor = payload.playerColor;
            this.mapSizeWidth = payload.mapSizeWidth;
            this.mapSizeHeight = payload.mapSizeHeight;
            this.playerPosX = payload.playerPosX;
            this.playerPosY = payload.playerPosY;
            this.visibleCells = {
                left: payload.visibleCells.left,
                right: payload.visibleCells.right,
                down: payload.visibleCells.down,
                up: payload.visibleCells.up,
                center: payload.visibleCells.center
            }
            //players: Array(4).fill({color: 0, x: 0, y: 0}),
            //cells: Array(payload.height).fill(CellType.INVISIBLE).map(() => Array(payload.width)),
        }
    }
}

class GameStartResponse extends Response {
    constructor() {
        super();
    }

    parse(data) {
        let payload = this._innerParse(data);
        let response = {
            playerColor: +payload[1],
            mapSizeWidth: +payload[2],
            mapSizeHeight: +payload[3],
            playerPosX: +payload[4],
            playerPosY: +payload[5],
            visibleCells: {
                left: +payload[6],
                right: +payload[7],
                down: +payload[8],
                up: +payload[9],
                center: +payload[10]
            }
        }

        return new GameStartParsedResponse(response);
    }
}

module.exports = GameStartResponse;