const CELL_SIZE = 64;

const CellType = Object.freeze({
    INVISIBLE: -1,
    FLOOR: 0,
    WALL: 1,
    EXIT: 2,
});

const PlayerType = Object.freeze({
    PLAYER_1: 3,
    PLAYER_2: 4,
    PLAYER_3: 5,
    PLAYER_4: 6,
});

module.exports = { CellType, PlayerType, CELL_SIZE }