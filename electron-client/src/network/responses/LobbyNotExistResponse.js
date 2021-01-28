const { Response, ParsedResponse } = require("./Response");

class LobbyNotExistParsedResponse extends ParsedResponse {
    constructor(payload) {
        super("LobbyNotExist", payload);
    }
}

class LobbyNotExistResponse extends Response {
    constructor() {
        super();
    }

    parse(data) {
        let payload = this._innerParse(data);
        return new LobbyNotExistParsedResponse({ok: false});
    }
}

module.exports = LobbyNotExistResponse;