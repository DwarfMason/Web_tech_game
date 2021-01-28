const Request = require("./Request");

class LeaveLobbyRequest extends Request {
    constructor(status) {
        super(status);
    }

    parse(data) {
        return super.parse(data);
    }
}

module.exports = LeaveLobbyRequest;