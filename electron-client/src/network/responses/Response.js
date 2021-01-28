class ParsedResponse {
    constructor(type, payload) {
        this.type = type;
        this.payload = payload
    }
}

class Response {
    constructor() {
        this.type = this.constructor.name;
    }

    /*
     * Returns parsed data on success.
     * The format (use ParsedResponse):
     * {"type": "InsertYourTypeHere", "payload": {...}}
     */
    parse(data) {
        return {};
    }

    _innerParse(data) {
        return data.split(" ");
    }
}

module.exports = { Response, ParsedResponse };