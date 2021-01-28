const { Response, ParsedResponse } = require("./Response");

class NewTurnParsedResponse extends ParsedResponse {
    constructor(payload) {
        super("NewTurn", payload);
        this.turnId = payload.turnId;
        this.playerPosX = payload.playerPosX;
        this.playerPosY = payload.playerPosY;
        this.visibleCells = {
            left: payload.visibleCells.left,
            right: payload.visibleCells.right,
            down: payload.visibleCells.down,
            up: payload.visibleCells.up,
            center: payload.visibleCells.center
        }
        this.rivals = payload.rivals;
        //players: Array(4).fill({color: 0, x: 0, y: 0}),
        //cells: Array(payload.height).fill(CellType.INVISIBLE).map(() => Array(payload.width)),
    }
}

class NewTurnResponse extends Response {
    constructor() {
        super();
    }

    parse(data) {
        let payload = this._innerParse(data);
        let response = {
            turnId: +payload[1],
            playerPosX: +payload[2],
            playerPosY: +payload[3],
            visibleCells: {
                left: +payload[4],
                right: +payload[5],
                down: +payload[6],
                up: +payload[7],
                center: +payload[8]
            },
            rivals: {}
        }

        for (let i = 9; i < payload.length; i += 3) {
            response.rivals[+payload[i]] = { // color
                posX: +payload[i + 1],
                posY: +payload[i + 2],
                visible: (+payload[i + 1] !== 0) || (+payload[i + 2] !== 0)
            }
        }

        return new NewTurnParsedResponse(response);
    }
}

module.exports = NewTurnResponse;