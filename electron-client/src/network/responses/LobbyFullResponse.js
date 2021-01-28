const { Response, ParsedResponse } = require("./Response");

class LobbyFullParsedResponse extends ParsedResponse {
    constructor(payload) {
        super("LobbyFull", payload);
    }
}

class LobbyFullResponse extends Response {
    constructor() {
        super();
    }

    parse(data) {
        let payload = this._innerParse(data);
        return new LobbyFullParsedResponse({ok: false});
    }
}

module.exports = LobbyFullResponse;