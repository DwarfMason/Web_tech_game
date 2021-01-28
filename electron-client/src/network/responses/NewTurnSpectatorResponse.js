const { Response, ParsedResponse } = require("./Response");
const { CellType, PlayerType } = require("../../entities/MapCell");

class NewTurnSpectatorParsedResponse extends ParsedResponse {
    constructor(payload) {
        super("NewTurnSpectator", payload);
        this.turnId = payload.turnId;
        this.rivals = payload.rivals;
    }
}

class NewTurnSpectatorResponse extends Response {
    constructor() {
        super();
    }

    parse(data) {
        let payload = this._innerParse(data)
        let turnId = +payload[1];
        let rivals = {};

        for (let i = 2; i < payload.length; i += 3) {
            rivals[+payload[i]] = { // color
                posX: +payload[i + 1],
                posY: +payload[i + 2]
            }
        }

        let response = {
            turnId,
            rivals
        }

        return new NewTurnSpectatorParsedResponse(response);
    }
}

module.exports = NewTurnSpectatorResponse;