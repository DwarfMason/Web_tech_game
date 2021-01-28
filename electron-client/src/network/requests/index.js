const CreateLobby = require("./CreateLobbyRequest");
const JoinLobby = require("./JoinLobbyRequest");
const LeaveLobby = require("./LeaveLobbyRequest");
const NotifyReady = require("./NotifyReadyRequest");
const Move = require("./MoveRequest");
const JoinLobbySpectator = require("./JoinLobbySpectatorRequest");

module.exports = {
    CreateLobby,
    JoinLobby,
    LeaveLobby,
    NotifyReady,
    Move,
    JoinLobbySpectator
}