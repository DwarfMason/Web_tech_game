const Request = require("./Request");

class MoveRequest extends Request {
    constructor(status) {
        super(status);
    }

    parse(data) {
        let base = super.parse(data) + " ";
        base += data.turnId;
        return base;
    }
}

module.exports = MoveRequest;