const Request = require("./Request");

class NotifyReadyRequest extends Request {
    constructor(status) {
        super(status);
    }

    parse(data) {
        return super.parse(data);
    }
}

module.exports = NotifyReadyRequest;