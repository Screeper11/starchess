<script lang="ts">
  import { coordMap, boardHeight, boardWidth } from "./coordMap.js";
  import { kings_only } from "./initialPosition.js";
  import legalMoves from "./legalMoves.js";
  import Tile from "./Tile.svelte";

  const selectTile = (e: any) => {
    const getTileFromEvent = (e: any, className: string) => {
      debugger;
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
      // move(oldSelectedTile, selectedTile, selectedColor, selectedType);
    }
  };

  const getLegalMoves = (selectedTile: number) => {
    const isMovePossible = () => {
      return true;
    };
    const isMoveNotBlocked = () => {
      return true;
    };
    const isMoveCapture = () => {
      return true;
    };
    const doesMoveLeaveCheck = () => {
      return true;
    };

    const pieceType = game[selectedTile];
    if (pieceType == undefined) {
      return;
    }

    let legalMoves = [];
    for (const tile of tiles.filter((t) => t.showOrHide == "show")) {
      if (doesMoveLeaveCheck()) {
        continue;
      }
      switch (pieceType) {
        case "king":
          if (isMovePossible() && isMoveNotBlocked()) {
            legalMoves.push(tile.relativeCoord);
          }
          break;
        case "queen":
          if (isMovePossible() && isMoveNotBlocked()) {
            legalMoves.push(tile.relativeCoord);
          }
          break;
        case "bishop":
          if (isMovePossible() && isMoveNotBlocked()) {
            legalMoves.push(tile.relativeCoord);
          }
          break;
        case "rook":
          if (isMovePossible() && isMoveNotBlocked()) {
            legalMoves.push(tile.relativeCoord);
          }
          break;
        case "knight":
          if (isMovePossible()) {
            legalMoves.push(tile.relativeCoord);
          }
          break;
        case "pawn":
          if (isMovePossible()) {
            legalMoves.push(tile.relativeCoord);
          }
          break;
        default:
          throw new Error("unknown pieceType: " + pieceType);
      }
    }
    return legalMoves;
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
          piece: game[relativeCoord],
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
  let gameStatus = "test";
  let game: { [key: number]: string } = kings_only;

  $: selectedAbsoluteCoord = Object.keys(coordMap).find(
    (key) => coordMap[Number(key)] == selectedTile
  );
  $: selectedPiece = game[selectedTile];
  $: selectedPieceLegalMoves = getLegalMoves(selectedTile);
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
