const Request = require("./Request");

class JoinLobbySpectatorRequest extends Request {
    constructor(status) {
        super(status);
    }

    parse(data) {
        let base = super.parse(data) + " ";
        base += data.sessionId;
        return base;
    }
}

module.exports = JoinLobbySpectatorRequest;