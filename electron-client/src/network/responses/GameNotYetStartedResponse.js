const { Response, ParsedResponse } = require("./Response");

class GameNotYetStartedParsedResponse extends ParsedResponse {
    constructor(payload) {
        super("GameNotYetStarted", payload);
    }
}

class GameNotYetStartedResponse extends Response {
    constructor() {
        super();
    }

    parse(data) {
        let payload = this._innerParse(data);
        return new GameNotYetStartedParsedResponse({ok: false});
    }
}

module.exports = GameNotYetStartedResponse;