package dk.im2b

import java.io.OutputStream
import java.net.ServerSocket
import java.net.Socket
import java.util.*
import kotlin.concurrent.thread
import Player
import Session
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking

var server: Server = Server()

fun main(args: Array<String>) {
    server.run()
}

class Server {
    lateinit var waitList: Session
    var lobbyCount: Int = 0
    var sessions: MutableMap<Int, Session> = mutableMapOf()
    private var playerCount: Int = 0
    private val server = ServerSocket(2020)

    fun run() {
        println("Server is running on port ${server.localPort}")
        // Создаем лобби в котором находятся все игроки до подключения в игровые комнаты
        waitList = Session(Session.Status.IDLING)
        println("Waitlist is ready! There are ${waitList.playerCount} live connections now!")
        println("----------------------------------------------------------------")
        while (true) {
            val client = server.accept()
            println("Client connected: ${client.inetAddress.hostAddress}. His ID is ${playerCount}")
            // Отпускаем клиента в отдельный поток обработки
            thread { ClientHandler(client, playerCount++, waitList).run() }
        }
    }

    //Создание новой сессии на сервере
    fun createSession(_player: Player) {
        sessions[lobbyCount] = Session(Session.Status.LOBBY, lobbyCount++, _player)
    }

    //Удаление существующей сессии на сервере
    fun deleteSession(_id: Int) {
        sessions.remove(_id)
    }
}

class ClientHandler(_client: Socket, _playerId: Int, _waitList: Session) {
    private val reader: Scanner
    private val writer: OutputStream
    private var running: Boolean = false
    private val player: Player

    init {
        reader = Scanner(_client.getInputStream())
        writer = _client.getOutputStream()
        player = Player(_playerId, _client, _waitList)
        player.session.addPlayer(player)
        println("Player ${player.id} was moved to the main lobby!")
    }

    fun run() = runBlocking {
        running = true
        player.write("500")
        while (running) {
            try {
                val text = reader.nextLine()
                launch((Dispatchers.Default)) {
                    command(text)
                }
            } catch (ex: Exception) {
                // TODO: Обработка исключений
                shutdown()
            } finally {

            }

        }
    }

    //Обработчик  входящих сообщений
    //_msg строка содержащая в себе код команды и аргументы, разделенные " "
    suspend fun command(_msg: String) {
        val msg = _msg.split(" ")
        when (msg[0]) {
            //Запрос на создание сессии
            "110" -> {
                if (player.status != Player.Status.IDLING)
                    player.write("666")
                server.createSession(player)
                player.write("505 ${player.session.id}")
            }
            //Запрос на подключение к сессии
            "105" -> toLobby(msg[1])
            //Подтверждение готовности в лобби
            "112" -> ready()
            //Покинуть лобби
            "106" -> back()
            //Движение влево
            "202" -> move(msg[0], msg[1].toInt())
            //Движение вправо
            "203" -> move(msg[0], msg[1].toInt())
            //Движение вниз
            "204" -> move(msg[0], msg[1].toInt())
            //Движение ввверх
            "205" -> move(msg[0], msg[1].toInt())
            //Общая ошибка, распознать нельзя
            else -> player.write("666")
        }
    }

    //Функция добавления игрока в лобби.
    // _msg номер лобби для подключения.
    private fun toLobby(_msg: String) {
        //Нельзя попасть в лобби не из стартового меню
        if (player.status != Player.Status.IDLING)
            player.write("666")
        if (server.sessions.containsKey(_msg.toInt())) {
            val code: String = server.sessions[_msg.toInt()]!!.addPlayer(player)
            val responce = "${code} ${player.session.ready} ${player.session.playerCount}"
            announce(true, responce)
        } else {
            //Лобби не найдено
            player.write("506")
        }
    }

    //Функция для показания готовности игроков в сессии к старту игры
    private fun ready() {
        if (player.status == Player.Status.LOBBY) {
            player.status = Player.Status.READY
            player.session.ready++
            if (player.session.ready == player.session.playerCount) {
                startGame()
            } else {
                announce(true, "509 ${player.session.ready} ${player.session.playerCount}")
            }
        } else {
            player.write("666")
        }
    }

    //Функция выхода из лобби
    private fun back() {
        if (player.status == Player.Status.LOBBY || player.status == Player.Status.READY) {
            if (player.session.playerCount != 1) {
                player.session.removePlayer(player)
                announce(false, "508 ${player.session.playerCount}")
            } else {
                server.deleteSession(player.session.id)
            }
            server.waitList.addPlayer(player)
            player.write("500")
        } else {
            player.write("666")
        }
    }

    private fun move(_direction: String, _turn: Int) {
        if (player.status == Player.Status.INGAME && _turn == player.session.turn) {
            player.transPos = arrayOf(player.pos[0], player.pos[1])
            when (_direction.toInt()) {
                202 -> player.transPos[0]--
                203 -> player.transPos[0]++
                204 -> player.transPos[1]++
                205 -> player.transPos[1]--
            }
            player.ready = true
        } else {
            if (_turn == player.session.turn) {
                player.write("700")
            } else {
                player.write("666")
            }
        }
    }

    //Начинаем игру и наконец-то отвязываем от хэндлера ответственность
    private fun startGame() {
        thread { server.sessions[player.session.id]!!.setupGame() }
    }

    //Функция отправки сообщения всем игрокам в сессии
    // _everyone -> true  говорит о том, что сообщение должны получить все пользователи сессии
    //           -> false говорит о том, что сообщение будет получено всеми, кроме данного пользователя
    private fun announce(_everyone: Boolean, _announcement: String) {
        if (!_everyone) {
            for (x in player.session.players.values) {
                if (player != x) {
                    x.write(_announcement)
                }
            }
        } else {
            for (x in player.session.players.values) {
                x.write(_announcement)
            }
        }
    }

    //Закрытие сокета соединения с клиентом с соответствующими обработками
    private fun shutdown() {
        running = false
        player.socket.close()
        println("${player.socket.inetAddress.hostAddress} with id ${player.id} closed the connection")
        player.session.removePlayer(player)
        if (player.session.playerCount == 0 && player.session.status != Session.Status.IDLING) {
            server.deleteSession(player.session.id)
        }
    }

}

