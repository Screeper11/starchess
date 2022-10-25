<script>
    import Tile from "./Tile.svelte";
    import coordMap from "./coordMap";
    import legalMoves from "./legalMoves";
    import { handle_promise } from "svelte/internal";

    const boardWidth = 10;
    const boardHeight = 7;

    const initialPosition = {
        17: "white_king",
        21: "black_king",
    };

    const selectTile = (e) => {
        let newSelectedTile;
        if (e.target?.classList.contains("piece")) {
            e.composedPath()?.forEach((element) => {
                if (element.classList?.contains("show"))
                    newSelectedTile = element.innerText;
            });
        }
        if (newSelectedTile == selectedTile) {
            selectedTile = 0;
        } else {
            selectedTile = newSelectedTile;
        }
    };

    const canMove = (relativeCoord) => {
        if (selectedType == undefined || selectedTile == 0) {
            return false;
        }
        if (selectedTile == relativeCoord) {
            return true;
        }
        return legalMoves[selectedType][selectedTile].includes(relativeCoord);
    };

    let tiles;
    let selectedTile = 0;
    let gameStatus = "ongoing";
    let game = initialPosition;

    const render = () => {
        console.log('render');
        let absoluteCoordNumber = 1;
        let tempTiles = [];
        for (let i = 0; i < boardHeight; i++) {
            for (let j = 0; j < boardWidth; j++) {
                let showOrHide =
                    coordMap[absoluteCoordNumber] != undefined
                        ? "show"
                        : "hide";
                let evenOrOdd = absoluteCoordNumber % 2 == 0 ? "even" : "odd";
                const relativeCoord = coordMap[absoluteCoordNumber] || 0;
                tempTiles.push({
                    absoluteCoord: absoluteCoordNumber,
                    relativeCoord: relativeCoord,
                    showOrHide: showOrHide,
                    evenOrOdd: evenOrOdd,
                    piece: game[relativeCoord],
                    isSelected: selectedTile == relativeCoord,
                    canMove: canMove(relativeCoord),
                });
                absoluteCoordNumber++;
            }
        }
        tiles = tempTiles;
    };


    $: selectedAbsoluteCoord = Object.keys(coordMap).find(
        (key) => coordMap[key] == selectedTile
    );
    $: selectedPiece = game[selectedTile];
    $: selectedColor = selectedPiece?.split("_")[0];
    $: selectedType = selectedPiece?.split("_")[1];
    $: selectedTile, render();
</script>

<div class="main">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="board">
        {#each tiles as tile}
            <div class="tile" on:click={selectTile}>
                <Tile tileData={tile} />
            </div>
        {/each}
    </div>
    <div class="debug">
        <h2>DEBUG</h2>
        <table style="width:100%">
            <tr>
                <th>game status</th>
                <td>{gameStatus}</td>
            </tr>
            <tr>
                <th>selected tile</th>
                <td>{selectedTile}</td>
            </tr>
            <tr>
                <th>absolute coord</th>
                <td>{selectedAbsoluteCoord}</td>
            </tr>
            <tr>
                <th>selected piece</th>
                <td>{selectedPiece}</td>
            </tr>
            <tr>
                <th>selected color</th>
                <td>{selectedColor}</td>
            </tr>
            <tr>
                <th>selected type</th>
                <td>{selectedType}</td>
            </tr>
        </table>
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

    .tile {
        display: inline-block;
    }

    .debug {
        padding: 10px;
        border: 2px dashed black;
        min-width: 320px;

        font-size: 18px;
        font-family: "Courier New", Courier, monospace;
    }

    h2 {
        text-align: center;
    }
    th {
        text-align: left;
    }
    td {
        text-align: right;
    }
</style>
