import dk.im2b.Server
import java.net.Socket

class Session(_status: Status) {
    var map: Array<Array<Int>>? = null
    var playerCount: Int = 0
    var players: MutableMap<Int, Player> = mutableMapOf( 0 to Player(0, Socket(), this))
    var id: Int = 0
    var turn: Int = 0
    var status: Status

    enum class Status{
        IDLING,
        LOBBY,
        INGAME,
        FINISHED
    }

    init{
        status = _status
    }

    constructor(_status: Status, _id: Int, _player: Player) : this(_status){
        id = _id
        players[_player.id] = _player
    }

    fun addPlayer(_player: Player){
        _player.status = Player.Status.valueOf(status.name)
        playerCount++
        players.put(_player.id, _player)
    }

    fun removePlayer(_player: Player){
        playerCount--
        players.remove(_player.id)
    }
}