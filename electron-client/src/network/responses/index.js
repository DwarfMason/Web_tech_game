const ServerConnected = require("./ServerConnectedResponse");
const UnknownError = require("./UnknownErrorResponse");
const LobbyCreated = require("./LobbyCreatedResponse");
const LobbyNotExist = require("./LobbyNotExistResponse");
const LobbyFull = require("./LobbyFullResponse");
const PlayerLeft = require("./PlayerLeftResponse");
const PlayerReady = require("./PlayerReadyResponse");
const GameStart = require("./GameStartResponse");
const NewTurn = require("./NewTurnResponse");
const WrongTurnId = require("./WrongTurnIdResponse");
const GameOver = require("./GameOverResponse");

module.exports = {
    ServerConnected,
    UnknownError,
    LobbyCreated,
    LobbyNotExist,
    LobbyFull,
    PlayerLeft,
    PlayerReady,
    GameStart,
    NewTurn,
    WrongTurnId,
    GameOver
}