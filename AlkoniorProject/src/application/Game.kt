package application

import field.CellValue
import field.GameField
import field.Mouse
import field.MouseValue
import javafx.beans.InvalidationListener
import javafx.beans.value.ChangeListener
import javafx.beans.value.ObservableValue
import javafx.event.EventHandler
import javafx.geometry.Point2D
import javafx.geometry.Pos
import javafx.scene.control.Label
import javafx.scene.control.Slider
import javafx.scene.image.Image
import javafx.scene.image.ImageView
import javafx.scene.input.MouseButton
import javafx.scene.input.MouseEvent
import javafx.scene.layout.*
import kotlinx.coroutines.processNextEventInCurrentThread
import models.GameFieldModel
import tornadofx.ChangeListener
import tornadofx.View
import java.awt.Point

class Game : View("Mice in lab.") {
    override val root: AnchorPane by fxml("/views/game.fxml")

    val fieldview: GridPane by fxid()
    val fieldcontaner: AnchorPane by fxid()
    val SessionId: Label by fxid()
    val timer: Slider by fxid()

    private var screen_width: Int = 0
    private var screen_height: Int = 0

    private val cellSize = 64

    private var max_screen_width: Int = 100
    private var max_screen_height: Int = 100


    var border = 3;

    private var current_pos_x: Int = 0;
    private var current_pos_y: Int = 0;


    private val field_: GameFieldModel by inject()
    private val field = field_.field.field

    private val floorimg = Image("/img/void.png")
    private val wallimg = Image("/img/wall.png")
    private val krisaimg = Image("/img/krisa.png")
    private val fogimg = Image("/img/fog.png")
    private val nothingimg = Image("/img/nothing.png")
    private val erroeimg = Image("/img/error.png")

    private val playersimgs = listOf(
        Image("/img/first.png"),
        Image("/img/second.png"),
        Image("/img/third.png"),
        Image("/img/forth.png")
    )


    private var clicked_point_x = 0;
    private var clicked_point_y = 0;

    var last_point = Point2D(0.0, 0.0);

    var field_margine_x = current_pos_x * cellSize * 1.0;
    var field_margine_y = current_pos_y * cellSize * 1.0;


    private var firstLayer = mutableListOf<MutableList<ImageView>>()
    private var multyKrisaLayer = mutableListOf<MutableList<MutableList<ImageView>>>()
    private var secondLayer = mutableListOf<MutableList<ImageView>>()
    private var thirdLayer = mutableListOf<MutableList<ImageView>>()
    private var textLayer = mutableListOf<MutableList<Label>>()

    init {
        /*
            screen_height = ((fieldview.prefHeight.toInt() + cellSize - 1) / cellSize)+2*border;
            screen_width = ((fieldview.prefWidth.toInt() + cellSize - 1) / cellSize)+2*border;
        */

        screen_height = field.height;
        screen_width = field.width;

        max_screen_height = ((fieldview.prefHeight.toInt() + cellSize - 1) / cellSize)
        max_screen_width = ((fieldview.prefWidth.toInt() + cellSize - 1) / cellSize)

        currentStage?.setResizable(false)
        for (i in 1..screen_height) {
            fieldview.columnConstraints.add(ColumnConstraints(cellSize * 1.0))
        }

        for (i in 1..screen_width) {
            fieldview.columnConstraints.add(ColumnConstraints(cellSize * 1.0))
        }

        for (i in 0..(screen_width - 1)) {
            firstLayer.add(mutableListOf())
            multyKrisaLayer.add(mutableListOf())
            secondLayer.add(mutableListOf())
            thirdLayer.add(mutableListOf())
            textLayer.add(mutableListOf())
            for (j in 0..(screen_height - 1)) {

                firstLayer[i].add(ImageView())
                secondLayer[i].add(ImageView())
                thirdLayer[i].add(ImageView())
                textLayer[i].add(Label(""))

                var image1 = firstLayer[i][j]
                var image2 = secondLayer[i][j]
                var image3 = thirdLayer[i][j]
                var label = textLayer[i][j]

                image1.fitWidth = cellSize * 1.0;
                image1.fitHeight = cellSize * 1.0;
                image2.fitWidth = cellSize * 1.0;
                image2.fitHeight = cellSize * 1.0;
                image3.fitWidth = cellSize * 1.0;
                image3.fitHeight = cellSize * 1.0;

                val panel = FlowPane()
                panel.prefWidth = 64.0
                panel.prefHeight = 64.0

                multyKrisaLayer[i].add(mutableListOf())

                run {
                    for (k in 1..4)
                    {
                        val image = ImageView()
                        image.image = nothingimg
                        image.fitHeight = cellSize/2*1.0
                        image.fitWidth = cellSize/2*1.0
                        panel.add(image)
                        multyKrisaLayer[i][j].add(image)
                    }
                }

                label.minWidth = cellSize * 1.0;
                label.maxWidth = cellSize * 1.0;
                label.setStyle("-fx-border-color: rgba(0, 0, 0, 0.0);");
                label.alignment = (Pos.CENTER);

                fieldview.add(image1, i, j)
                fieldview.add(panel, i, j)
                fieldview.add(image2, i, j)
                fieldview.add(image3, i, j)
                fieldview.add(label, i, j)

            }
        }

        field.addListener { field ->
            upade_view(field as GameField)
        }


        fieldcontaner.onMouseDragged = EventHandler<MouseEvent> { event -> dragNdrop(event) }
        fieldcontaner.onMousePressed = EventHandler<MouseEvent> { event ->
            run {
                last_point = Point2D(event.getSceneX(), event.getSceneY());
            }
        }
        fieldcontaner.onMouseReleased = EventHandler<MouseEvent> { event ->
            run {
                last_point = Point2D(event.getSceneX(), event.getSceneY());
                draging = false;
            }
        }


        val stageSizeListener: ChangeListener<Number> =
            ChangeListener<Number> { observable, oldValue, newValue ->
                run {
                    max_screen_height = (((currentStage?.getHeight()?.toInt() ?: 0) + cellSize - 1) / cellSize);
                    max_screen_width = (((currentStage?.getWidth()?.toInt() ?: 0) + cellSize - 1) / cellSize);
                    println(
                        "Height: " + max_screen_height + " Width: " + max_screen_width
                    )
                    fixmagrine(0.0, 0.0);
                }
            }


        currentStage?.widthProperty()?.addListener(stageSizeListener)
        currentStage?.heightProperty()?.addListener(stageSizeListener)

        field_.field.cur_second.addListener(ChangeListener { observable, oldValue, newValue ->
            timer.value = (newValue.toDouble() / field_.field.max_seconds * 100)
        })

        currentStage?.setResizable(true)
        upade_view(field)
        fieldcontaner.onMouseClicked = EventHandler<MouseEvent> { event ->
            run {
                val point = Point2D(event.getSceneX(), event.getSceneY())
                println(
                    "x = ${(((event.getSceneX() - field_margine_x).toInt()) / cellSize) + current_pos_x};" +
                            " y = ${(((event.getSceneY() - field_margine_y).toInt()) / cellSize) + current_pos_y}\n" +
                            "field_margine_x = ${field_margine_x}, field_margine_y = ${field_margine_y}\n" +
                            "current_pos_x = ${current_pos_x}, current_pos_y = ${current_pos_y}," +
                            ""
                );
                clicked_point_x = (((event.getSceneX() - field_margine_x).toInt()) / cellSize) + current_pos_x
                clicked_point_y = (((event.getSceneY() - field_margine_y).toInt()) / cellSize) + current_pos_y
                mouse_clicked(clicked_point_x, clicked_point_y);

            }
        }
        AnchorPane.setLeftAnchor(fieldview, field_margine_x);
        AnchorPane.setTopAnchor(fieldview, field_margine_y);

        SessionId.text = field_.field.sessionId
    }

    var draging = false;

    fun fixmagrine(
        deltaX: Double,
        deltaY: Double
    ) {
        if ((-(screen_width - border - 1) * cellSize <= field_margine_x + deltaX) and (field_margine_x + deltaX <= (max_screen_width - border - 1) * cellSize)) {
            field_margine_x += deltaX;
        } else {
            if (-(screen_width - border - 1) * cellSize > field_margine_x + deltaX) {
                field_margine_x = -(screen_width - border - 1) * cellSize * 1.0
            }
            if (field_margine_x + deltaX > (max_screen_width - border - 1) * cellSize) {
                field_margine_x = (max_screen_width - border - 1) * cellSize * 1.0
            }
        }

        if ((-(screen_height - border - 1) * cellSize + 40 <= field_margine_y + deltaY) and (field_margine_y + deltaY <= (max_screen_height - border - 1) * cellSize - 30)) {
            field_margine_y += deltaY;
        } else {
            if (field_margine_y + deltaY > (max_screen_height - border - 1) * cellSize - 30) {
                field_margine_y = (max_screen_height - border - 1) * cellSize - 30 * 1.0
            }
            if (-(screen_height - border - 1) * cellSize + 40 > field_margine_y + deltaY) {
                field_margine_y = -(screen_height - border - 1) * cellSize * 1.0 + 40
            }
        }
        AnchorPane.setLeftAnchor(fieldview, field_margine_x);
        AnchorPane.setTopAnchor(fieldview, field_margine_y);
    }

    fun dragNdrop(event: MouseEvent) {
        if (event.button == MouseButton.PRIMARY) {
            var current_point = Point2D(event.sceneX, event.sceneY);

            val deltaX: Double = event.sceneX - last_point.x
            val deltaY: Double = event.sceneY - last_point.y


            if (draging) {


                fixmagrine(deltaX, deltaY);


                last_point = current_point
            }
            if (Math.abs(deltaX) + Math.abs(deltaY) > 5) {
                draging = true;
                last_point = current_point
            }
        }
        event.consume()
    }

    fun upade_view(field: GameField) {
        for (i in 0..(screen_width - 1)) {
            for (j in 0..(screen_height - 1)) {


                val image1 = firstLayer[i][j]
                val image2 = secondLayer[i][j]
                val label = textLayer[i][j]

                val multylevel = multyKrisaLayer[i][j]

                val cell = field[i + current_pos_x, j + current_pos_y];


                var i2 =
                    when (cell.shadow) {
                        0 -> nothingimg
                        1 -> fogimg
                        else -> erroeimg
                    }
                var i1 =
                    when (cell.value) {
                        CellValue.VOID -> fogimg;
                        CellValue.FLOOR -> floorimg;
                        CellValue.WALL -> wallimg;
                        CellValue.EXIT -> krisaimg;
                        else -> erroeimg
                    }

                if (image1.image != i1) {
                    image1.image = i1
                }
                if (image2.image != i2) {
                    image2.image = i2
                }
                if (label.text != cell.text) {
                    label.text = cell.text
                }
            }
        }

        var players  = LinkedHashMap<Point,MutableList<MouseValue>>()

        for (player in field.players_position)
        {
            if (players.containsKey(player.p))
                players[player.p]?.add(player.color)
            else
                players.put(player.p, mutableListOf(player.color))
        }

        for (value in players)
        {
            if (value.value.size==1)
            {
                firstLayer[value.key.x][value.key.y].image = krisa_img(value.value[0])
                multyKrisaLayer[value.key.x][value.key.y].map {iii -> { iii.isVisible = false }}
            }else
            {

                firstLayer[value.key.x][value.key.y].image = floorimg
                for (i in 0..(value.value.size-1))
                {
                    multyKrisaLayer[value.key.x][value.key.y][i].isVisible = true
                    multyKrisaLayer[value.key.x][value.key.y][i].image = krisa_img(value.value[i])
                }
                for (i in (value.value.size)..3)
                {
                    multyKrisaLayer[value.key.x][value.key.y][i].isVisible = false
                }
            }
        }
    }

    private fun krisa_img(color:MouseValue):Image
    {
        return when(color){
            MouseValue.RED -> playersimgs[0]
            MouseValue.BLUE ->  playersimgs[1]
            MouseValue.GREEN ->  playersimgs[2]
            MouseValue.YELLOW ->   playersimgs[3]
            else -> nothingimg
        }
    }

    fun mouse_clicked(x: Int, y: Int) {

    }

}
