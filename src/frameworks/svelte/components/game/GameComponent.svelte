<script lang="ts">
  import { coordMap, boardHeight, boardWidth } from "./constants";
  import { fetchGameState, move } from "./server/gameServer";
  import Tile from "./Tile.svelte";

  const playerID = "playerID"; // TODO

  const selectTile = (e: any) => {
    const getTileFromEvent = (e: any, className: string) => {
      debugger; // TODO e type
      if (
        e.target?.classList.contains("piece") ||
        e.target?.classList.contains("tile-content")
      ) {
        for (const element of e.composedPath()) {
          if (element.classList?.contains("show")) return element.innerText;
        }
      }
    };

    const oldSelectedTile = selectedTile;
    const oldSelectedType = selectedType;
    selectedTile = getTileFromEvent(e, "piece");

    if (oldSelectedType != undefined) {
      move(playerID, oldSelectedTile, selectedTile);
      gameState = fetchGameState();
    }
  };

  const render = () => {
    let absoluteCoordNumber = 1;
    let tempTiles = [];
    for (let i = 0; i < boardHeight; i++) {
      for (let j = 0; j < boardWidth; j++) {
        let showOrHide =
          coordMap[absoluteCoordNumber] != undefined ? "show" : "hide";
        let evenOrOdd = absoluteCoordNumber % 2 == 0 ? "even" : "odd";
        const relativeCoord = coordMap[absoluteCoordNumber] || 0;
        tempTiles.push({
          absoluteCoord: absoluteCoordNumber,
          relativeCoord: relativeCoord,
          showOrHide: showOrHide,
          evenOrOdd: evenOrOdd,
          piece: gameState.gamePosition[relativeCoord - 1],
          isSelected: selectedTile == relativeCoord,
          canMove: false, // TODO
        });
        absoluteCoordNumber++;
      }
    }
    tiles = tempTiles;
  };

  let tiles: any[] = [];
  let selectedTile: number;
  let gameState: {
    gamePosition: (string | null)[];
    legalMoves: { [key: number]: number[] };
    winner: string;
    nextPlayer: string;
    isMoveCheck: boolean;
    isMoveTake: boolean;
  } = fetchGameState(); // Whenever server pushes new gameState

  $: selectedAbsoluteCoord = Object.keys(coordMap).find(
    (key) => coordMap[Number(key)] == selectedTile
  );
  $: selectedPiece = gameState.gamePosition[selectedTile];
  $: selectedPieceLegalMoves = gameState.legalMoves;
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
        <th>winner</th>
        <td>{gameState.winner}</td>
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
      <tr>
        <th>check</th>
        <td>{gameState.isMoveCheck}</td>
      </tr>
      <tr>
        <th>take</th>
        <td>{gameState.isMoveTake}</td>
      </tr>
    </table>
  </div>
</div>

<style lang="scss">
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
    font-size: 0;
  }

  .tile {
    display: inline-block;
  }

  .debug {
    padding: 10px;
    border: 2px dashed black;
    min-width: 290px;

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
