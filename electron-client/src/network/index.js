const net = require("net");
const Requests = require("./requests");
const Responses = require("./responses");

class Serializer {
    constructor(baseList) {
        this._serializers = {}
        for (let name of Object.keys(baseList)) {
            this.serializers[name] = new (baseList[name].requestClass)(baseList[name].status);
        }
    }

    addSerializers(name, {requestClass, status}) {
        this.serializers[name] = new requestClass(status);
    }

    get serializers() {
        return this._serializers;
    }

    serialize(data) {
        return this._serializers[data.type].parse(data);
    }
}

class Dispatcher {
    constructor(baseList) {
        this.codeDispatchers = {}
        for (let code of Object.keys(baseList)) {
            this.codeDispatchers[code] = new (baseList[code])();
        }
    }

    addDispatcher(code, dispatcherClass) {
        if (typeof code === "string") {
            code = +code;
        }
        this.codeDispatchers[code] = new dispatcherClass();
    }

    get dispatchers() {
        return this.codeDispatchers;
    }

    parse(data) {
        let response = data.split(" ");
        return this.codeDispatchers[+response[0]].parse(data);
    }
}

class GameSocket {
    constructor(addr, port, emitter) {
        this._address = addr;
        this._port = port;
        this._client = new net.Socket();
        this._emitter = emitter;
        this._serializer = new Serializer({
            "CreateLobby": {
                requestClass: Requests.CreateLobby,
                status: 110
            },
            "JoinLobby": {
                requestClass: Requests.JoinLobby,
                status: 105
            },
            "NotifyReady": {
                requestClass: Requests.NotifyReady,
                status: 112
            },
            "LeaveLobby": {
                requestClass: Requests.LeaveLobby,
                status: 106
            },
            "MoveLeft": {
                requestClass: Requests.Move,
                status: 202
            },
            "MoveRight": {
                requestClass: Requests.Move,
                status: 203
            },
            "MoveDown": {
                requestClass: Requests.Move,
                status: 204
            },
            "MoveUp": {
                requestClass: Requests.Move,
                status: 205
            },
        });
        this._dispatcher = new Dispatcher({
            500: Responses.ServerConnected,
            666: Responses.UnknownError,
            505: Responses.LobbyCreated,
            506: Responses.LobbyNotExist,
            507: Responses.LobbyFull,
            508: Responses.PlayerLeft,
            509: Responses.PlayerReady,
            510: Responses.GameStart,
            777: Responses.NewTurn,
            700: Responses.WrongTurnId,
            555: Responses.GameOver
        });
    }

    connect() {
        this._client.setNoDelay(true);
        this._client.connect(this._port, this._address, () => {
            console.log(`Connected to ${this._address}:${this._port}`);
        });

        this._client.on('error', (e) => {
            this._emitter.emit('error', e);
        })

        this._client.on('data', (data) => {
            if (typeof data !== "string") {
                data = data.toString("ascii"); // Buffer
            }
            let responses = data.split("\n");
            for (let response of responses) {
                if (response === "") continue;
                let parsedData = this._dispatcher.parse(response);
                parsedData["address"] = this._address;
                parsedData["port"] = this._port;
                this._emitter.emit("packet", parsedData);
                this._emitter.emit(parsedData.type, parsedData);
            }
        });
    }

    send(request) {
        let reqStr = this._serializer.serialize(request);
        this._client.write(reqStr + "\r\n");
    }

    disconnect() {
        this._client.destroy();
    }
}

module.exports = GameSocket;
