const Request = require("./Request");

class CreateLobbyRequest extends Request {
    constructor(status) {
        super(status);
    }

    parse(data) {
        return super.parse(data);
    }
}

module.exports = CreateLobbyRequest;
