<script lang="ts">
  import { coordMap, boardHeight, boardWidth } from "./constants";
  import { FieldType, TileData } from "./types";
  import type {
    GameState,
    MoveRequest,
  } from "./../../../../backend/gameServer/src/helpers/types";
  import Tile from "./Tile.svelte";
  import PiecePicker from "./PiecePicker.svelte";
  import ToggleSwitch from "./ToggleSwitch.svelte";
  import { onMount } from "svelte";

  const selectTile = (event: CustomEvent) => {
    const clickedTile = event.detail.tileNumber;
    if (!selectedTile) {
      if (
        gameState?.gamePosition[clickedTile]?.isWhite ===
        gameState?.nextPlayerIsWhite
      ) {
        selectedTile = clickedTile;
        lockSelection = true;
      }
    } else {
      if (gameState?.legalMoves[selectedTile]?.includes(clickedTile)) {
        const moveRequestData: MoveRequest = {
          playerToken,
          moveData: {
            startTile: selectedTile,
            endTile: clickedTile,
            promotionPiece: null,
          },
        };
        ws.send(JSON.stringify(moveRequestData));
      }
      selectedTile = undefined;
    }
  };

  const cancelSelection = () => {
    if (lockSelection) {
      lockSelection = false;
      return;
    }
    selectedTile = undefined;
  };

  const toggleAutoRotation = () => {
    autoRotation = !autoRotation;
  };

  const render = () => {
    isRotated = autoRotation && !gameState.nextPlayerIsWhite;
    const tempTiles: TileData[] = [];
    for (
      let absoluteCoord = 1;
      absoluteCoord <= boardHeight * boardWidth;
      absoluteCoord++
    ) {
      const relativeCoord = coordMap[absoluteCoord] || 0;
      const fieldType = !coordMap[absoluteCoord]
        ? FieldType.Hide
        : coordMap[absoluteCoord] > 37
        ? FieldType.Ghost
        : FieldType.Show;
      const isMoveable =
        !!selectedTile &&
        gameState?.legalMoves[selectedTile]?.includes(relativeCoord);
      const currentTile = gameState?.gamePosition[relativeCoord];
      const pieceType =
        currentTile?.pieceType !== undefined ? currentTile?.pieceType : null;
      const isWhite =
        currentTile?.isWhite !== undefined ? currentTile?.isWhite : null;
      tempTiles.push({
        absoluteCoord,
        relativeCoord: coordMap[absoluteCoord] || 0,
        isEven: absoluteCoord % 2 === 0,
        fieldType,
        pieceType,
        isWhite,
        isSelected: selectedTile === relativeCoord,
        isMoveable,
        isRotated,
      });
    }
    tiles = isRotated ? tempTiles.reverse() : tempTiles;
  };

  const playerToken = localStorage.getItem("token") || "";
  let tiles: TileData[] = [];
  let selectedTile: number | undefined;
  let lockSelection: boolean;
  let autoRotation = false;
  let isRotated = false;
  let gameState: GameState;
  let ws: WebSocket;
  onMount(() => {
    ws = new WebSocket("ws://localhost:4003");
    ws.addEventListener("message", (e) => {
      const gameStateData: GameState = JSON.parse(e.data);
      gameState = gameStateData;
    });
  });
  $: gameState, selectedTile, autoRotation, render();
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="main" on:click={cancelSelection}>
  <div class="board-area">
    <div class="board">
      {#each tiles as tile}
        <div class="tile">
          <Tile tileData={tile} on:tileSelection={selectTile} />
        </div>
      {/each}
    </div>
    <ToggleSwitch
      label={"Auto rotation"}
      disabled={!gameState}
      on:click={toggleAutoRotation}
    />
    <!-- <PiecePicker on:pieceSelection={selectPiece} /> -->
  </div>
  <div class="debug">
    <h2>DEBUG</h2>
    <table style="width:100%">
      {#if gameState}
        <tr>
          <th>game phase</th>
          <td>{gameState?.phase}</td>
        </tr>
        <tr>
          <th>selected tile</th>
          <td>{selectedTile}</td>
        </tr>
        <tr>
          <th>next player</th>
          <td>{gameState?.nextPlayerIsWhite ? "white" : "black"}</td>
        </tr>
        <tr>
          <th>check</th>
          <td>{gameState?.isMoveCheck}</td>
        </tr>
        <tr>
          <th>take</th>
          <td>{gameState?.isMoveTake}</td>
        </tr>
        <tr>
          <th>result</th>
          <td>{gameState?.gameResult}</td>
        </tr>
        <tr>
          <th>table rotated</th>
          <td>{isRotated}</td>
        </tr>
      {/if}
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
    max-height: 700px;
    min-width: 300px;

    font-size: 18px;
    line-height: 24px;
    font-family: "Courier New", Courier, monospace;
    margin-left: -60px;
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
