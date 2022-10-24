<script>
    import Tile from "./Tile.svelte";

    const boardWidth = 10;
    const boardHeight = 7;

    const coordMap = {
        3: 10,
        4: 16,
        6: 27,
        7: 34,
        13: 9,
        14: 15,
        15: 21,
        16: 26,
        17: 33,
        22: 3,
        23: 8,
        24: 14,
        25: 20,
        26: 25,
        27: 32,
        28: 36,
        31: 1,
        32: 2,
        33: 7,
        34: 13,
        35: 19,
        36: 24,
        37: 31,
        38: 35,
        39: 37,
        43: 6,
        44: 12,
        45: 18,
        46: 23,
        47: 30,
        53: 5,
        54: 11,
        55: 17,
        56: 22,
        57: 29,
        63: 4,
        67: 28,
    };

    const initialPosition = {
        17: "white_king",
        21: "black_king",
    }

    let tiles = [];
    let absoluteCoordNumber = 1;
    for (let i = 0; i < boardHeight; i++) {
        for (let j = 0; j < boardWidth; j++) {
            let showOrHide =
                coordMap[absoluteCoordNumber] != undefined ? "show" : "hide";
            let evenOrOdd = absoluteCoordNumber % 2 == 0 ? "even" : "odd";

            tiles.push({
                absoluteCoord: absoluteCoordNumber,
                relativeCoord: coordMap[absoluteCoordNumber] || 0,
                showOrHide: showOrHide,
                evenOrOdd: evenOrOdd,
            });
            absoluteCoordNumber++;
        }
    }

    let gameStatus = "ongoing";
    let game = initialPosition;
</script>

<div class="main">
    <div class="board">
        {#each tiles as tile, i}b
            <Tile tileData={tile} piece={game[tile.relativeCoord]}/>
        {/each}
    </div>
    <div class="debug">
        <b> DEBUG </b> <br> <br>
        game status: {gameStatus}
    </div>
</div>

<style>
    .main {
        display: flex;
        --s: 100px;
        --m: 2px;
        --r: calc(var(--s) * 3 * 1.1547 / 2 + 4 * var(--m));


    }

    .board {
        display: block;
        
        min-width: 910px;
        max-width: 910px;
        min-height: 730px;
        max-height: 730px;

        position: relative;
        left: calc(var(--s) * 1.1547 / 4 + var(--m));
        font-size: 0px;
    }

    .debug {
        padding: 10px;
        border: 2px dashed black;
        min-width: 280px;

        font-size: large;
        font-family: "Courier New", Courier, monospace;
    }
</style>
