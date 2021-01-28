const { Response, ParsedResponse } = require("./Response");

class PlayerReadyParsedResponse extends ParsedResponse {
    constructor(payload) {
        super("PlayerReady", payload);
        if (!this.error) {
            this.playersReady = payload.playersReady;
            this.playersTotal = payload.playersTotal;
        }
    }
}

class PlayerReadyResponse extends Response {
    constructor() {
        super();
    }

    parse(data) {
        let payload = this._innerParse(data);
        let response = {
            playersReady: +payload[1],
            playersTotal: +payload[2]
        }
        return new PlayerReadyParsedResponse(response);
    }
}

module.exports = PlayerReadyResponse;