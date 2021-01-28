const { Response, ParsedResponse } = require("./Response");

class ServerConnectedParsedResponse extends ParsedResponse {
    constructor(payload) {
        super("ServerConnected", payload);
        this.ok = payload.ok;
    }
}

class ServerConnectedResponse extends Response {
    constructor() {
        super();
    }

    parse(data) {
        let payload = this._innerParse(data);
        return new ServerConnectedParsedResponse({ok: true});
    }
}

module.exports = ServerConnectedResponse;