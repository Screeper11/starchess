<script lang="ts">
  import { coordMap, boardHeight, boardWidth, TileData } from "./constants";
  import Tile from "./Tile.svelte";
  import PiecePicker from "./PiecePicker.svelte";
  import { Game, GameState } from "./server/gameServer";

  const playerID = "playerID"; // TODO

  const selectTile = (event: CustomEvent) => {
    const tileNumber = event.detail.tileNumber;
    const clickedColor = gameState.gamePosition[tileNumber]?.split("_")[0];

    if (selectedTile === undefined) {
      if (clickedColor === gameState.nextPlayer) {
        selectedTile = tileNumber;
      }
    } else {
      if (gameState.legalMoves[selectedTile].includes(tileNumber)) {
        game.move(playerID, selectedTile, tileNumber);
        selectedTile = undefined;
        gameState = game.fetchGameState();
      }
    }
  };

  const cancelSelection = (e) => {
    // TODO
    console.log("Cancel selection");
    selectedTile = undefined;
  };

  const render = () => {
    let tempTiles: TileData[] = [];
    let absoluteCoordNumber = 1;
    for (let i = 0; i < boardHeight; i++) {
      for (let j = 0; j < boardWidth; j++) {
        let showOrHide =
          coordMap[absoluteCoordNumber] != undefined ? "show" : "hide";
        let evenOrOdd = absoluteCoordNumber % 2 == 0 ? "even" : "odd";
        const relativeCoord = coordMap[absoluteCoordNumber] || 0;
        const canMove = selectedTile
          ? gameState.legalMoves[selectedTile].includes(relativeCoord)
          : false;
        tempTiles.push({
          absoluteCoord: absoluteCoordNumber,
          relativeCoord: relativeCoord,
          showOrHide: showOrHide,
          evenOrOdd: evenOrOdd,
          piece: gameState.gamePosition[relativeCoord],
          isSelected: selectedTile == relativeCoord,
          canMove: canMove,
        });
        absoluteCoordNumber++;
      }
    }
    tiles = tempTiles;
  };

  let tiles: TileData[] = [];
  let selectedTile: number | undefined;
  const game = new Game();
  let gameState: GameState = game.fetchGameState(); // Whenever server pushes new gameState

  $: selectedAbsoluteCoord = Object.keys(coordMap).find(
    (key) => coordMap[Number(key)] == selectedTile
  );
  $: selectedTile, gameState, render();
</script>

<div class="main">
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- <div class="board" on:click={cancelSelection}> -->
  <div class="board">
    {#each tiles as tile}
      <div class="tile">
        <Tile tileData={tile} on:tileSelection={selectTile} />
      </div>
    {/each}
  </div>
  <PiecePicker />
  <div class="debug">
    <h2>DEBUG</h2>
    <table style="width:100%">
      <tr>
        <th>game phase</th>
        <td>{gameState.phase}</td>
      </tr>
      <tr>
        <th>selected tile</th>
        <td>{selectedTile}</td>
      </tr>
      <!-- <tr>
        <th>absolute coord</th>
        <td>{selectedAbsoluteCoord}</td>
      </tr> -->
      <tr>
        <th>next player</th>
        <td>{gameState.nextPlayer}</td>
      </tr>
      <tr>
        <th>check</th>
        <td>{gameState.isMoveCheck}</td>
      </tr>
      <tr>
        <th>take</th>
        <td>{gameState.isMoveTake}</td>
      </tr>
      <tr>
        <th>winner</th>
        <td>{gameState.winner}</td>
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
    line-height: 24px;
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
