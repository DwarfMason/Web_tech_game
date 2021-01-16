import java.net.Socket


class Player(_id: Int, _socket: Socket, _session: Session) {
    var session: Session
    var map = null
    var pos = null
    var id: Int
        private set
    var socket: Socket
        private set

    var status: Status

    enum class Status{
        IDLING,
        LOBBY,
        READY,
        INGAME,
        FINISHED
    }

    init{
        id = _id
        socket = _socket
        status = Status.IDLING
        session = _session
    }
}