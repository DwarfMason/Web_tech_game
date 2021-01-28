const { Response, ParsedResponse } = require("./Response");

class GameOverParsedResponse extends ParsedResponse {
    constructor(payload) {
        super("GameOver", payload);
        this.playersWon = payload.playersWon;
    }
}

class GameOverResponse extends Response {
    constructor() {
        super();
    }

    parse(data) {
        let payload = this._innerParse(data);
        let playersWon = [];

        for (let i = 1; i < payload.length; i += 2) {
            playersWon.push({
                sessionId: +payload[i],
                color: +payload[i + 1],
            });
        }

        return new GameOverParsedResponse({playersWon});
    }
}

module.exports = GameOverResponse;