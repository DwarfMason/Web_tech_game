const { Response, ParsedResponse } = require("./Response");

class WrongTurnIdParsedResponse extends ParsedResponse {
    constructor(payload) {
        super("WrongTurnId", payload);
        this.error = !payload.turnId;
        if (!this.error) {
            this.turnId = payload.turnId;
        }
    }
}

class WrongTurnIdResponse extends Response {
    constructor() {
        super();
    }

    parse(data) {
        let payload = this._innerParse(data);
        let turnId = +payload[1];
        return new WrongTurnIdParsedResponse({turnId});
    }
}

module.exports = WrongTurnIdResponse;