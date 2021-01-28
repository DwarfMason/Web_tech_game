const EventEmitter = require("events").EventEmitter;
const GameSocket = require("./network");

class GameManager {
    constructor() {
        this.socket = new GameSocket("", 0);
        this.eventEmitter = new EventEmitter();
    }
}

module.exports = new GameManager();