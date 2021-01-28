const { Response, ParsedResponse } = require("./Response");

class PlayerLeftParsedResponse extends ParsedResponse {
    constructor(payload) {
        super("PlayerLeft", payload);
        this.playersTotal = payload.playersTotal;
    }
}

class PlayerLeftResponse extends Response {
    constructor() {
        super();
    }

    parse(data) {
        let payload = this._innerParse(data);
        let playersTotal = +payload[1];
        return new PlayerLeftParsedResponse({playersTotal});
    }
}

module.exports = PlayerLeftResponse;