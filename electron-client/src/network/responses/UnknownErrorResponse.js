const { Response, ParsedResponse } = require("./Response");

class UnknownErrorParsedResponse extends ParsedResponse {
    constructor(payload) {
        super("UnknownError", payload);
    }
}

class UnknownErrorResponse extends Response {
    constructor() {
        super();
    }

    parse(data) {
        let payload = this._innerParse(data);
        return new UnknownErrorParsedResponse({ok: false});
    }
}

module.exports = UnknownErrorResponse;