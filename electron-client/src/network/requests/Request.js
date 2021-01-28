class Request {
    constructor(status) {
        this._status = status;
    }

    parse(data) {
        return "" + this._status;
    }
}

module.exports = Request;