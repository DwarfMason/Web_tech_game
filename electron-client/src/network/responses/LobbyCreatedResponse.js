const { Response, ParsedResponse } = require("./Response");

class LobbyCreatedParsedResponse extends ParsedResponse {
    constructor(payload) {
        super("LobbyCreated", payload);
        this.error = !payload.sessionId;
        if (!this.error) {
            this.sessionId = payload.sessionId;
        }
    }
}

class LobbyCreatedResponse extends Response {
    constructor() {
        super();
    }

    parse(data) {
        let payload = this._innerParse(data);
        let sessionId = +payload[1];
        return new LobbyCreatedParsedResponse({sessionId});
    }
}

module.exports = LobbyCreatedResponse;