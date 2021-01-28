const Request = require("./Request");

class JoinLobbyRequest extends Request {
    constructor(status) {
        super(status);
    }

    parse(data) {
        let base = super.parse(data) + " ";
        base += data.sessionId;
        return base;
    }
}

module.exports = JoinLobbyRequest;