<script lang="ts">
  import { coordMap, boardHeight, boardWidth } from "./constants";
  import { FieldType, TileData } from "./types";
  import {
    GameInfo,
    GameMode,
    GameResult,
    GameState,
    Move,
    PieceType,
    PlayerType,
  } from "./../../../../typesCopy";
  import Tile from "./Tile.svelte";
  import PiecePicker from "./PiecePicker.svelte";
  import Toolbar from "./Toolbar.svelte";
  import { onMount } from "svelte";
  import { BACKEND_URL, BACKEND_PORT } from "./../../../../env";

  function getMoveNotations(moveHistory: Move[]): string[] {
    const getPieceNotation = (piece: PieceType) => {
      // TODO implement
      switch (piece) {
        case PieceType.Pawn:
          return "";
        case PieceType.Knight:
          return "N";
        case PieceType.Bishop:
          return "B";
        case PieceType.Rook:
          return "R";
        case PieceType.Queen:
          return "Q";
        case PieceType.King:
          return "K";
      }
    };

    // const { startTile, endTile, promotionPiece } = move;

    // const piece = gameState.gamePosition[endTile];
    // if (!piece) {
    //   console.log(gameState.moveHistory);
    //   console.log(startTile);
    //   console.log(endTile);

    //   throw new Error("no piece at end tile");
    // }
    // if (startTile > 37) {
    //   const notation = `${getPieceNotation(piece?.pieceType)}${endTile}`;
    // }
    // const notation = `${getPieceNotation(piece?.pieceType)}${startTile}-${endTile}`;
    return [];
  }

  const selectTile = (event: CustomEvent) => {
    const clickedTile = event.detail.tileNumber;
    const clickedIsWhite = gameState?.gamePosition[clickedTile]?.isWhite;

    if (!selectedTile) {
      if (!gameState?.legalMoves[clickedTile]) return;
      if (playerType === PlayerType.White && !clickedIsWhite) return;
      if (playerType === PlayerType.Black && clickedIsWhite) return;
      if (playerType === PlayerType.Spectator) return;
      if (clickedIsWhite !== gameState?.nextPlayerIsWhite) return;
      selectedTile = clickedTile;
      lockSelection = true;
    } else {
      if (gameState?.legalMoves[selectedTile]?.includes(clickedTile)) {
        const moveRequestData: Move = {
          startTile: selectedTile,
          endTile: clickedTile,
          promotionPiece: null,
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

  const render = () => {
    isRotated = autoRotation
      ? !gameState.nextPlayerIsWhite
      : playerType === PlayerType.Black;
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
      const isTechnicallyMoveable =
        !!selectedTile &&
        gameState?.legalMoves[selectedTile]?.includes(relativeCoord);
      const playerIsWhiteAndTheirTurn =
        gameState?.nextPlayerIsWhite && playerType === PlayerType.White;
      const playerIsBlackAndTheirTurn =
        !gameState?.nextPlayerIsWhite && playerType === PlayerType.Black;
      const isMoveable =
        isTechnicallyMoveable &&
        (playerIsWhiteAndTheirTurn || playerIsBlackAndTheirTurn);
      const currentTile = gameState?.gamePosition[relativeCoord];
      const pieceType =
        currentTile?.pieceType !== undefined ? currentTile?.pieceType : null;
      const isWhite =
        currentTile?.isWhite !== undefined ? currentTile?.isWhite : null;
      const lastMove =
        gameState?.moveHistory[gameState?.moveHistory.length - 1];
      const isLastMove =
        lastMove?.startTile === relativeCoord ||
        lastMove?.endTile === relativeCoord;
      tempTiles.push({
        absoluteCoord,
        relativeCoord: coordMap[absoluteCoord] || 0,
        isEven: absoluteCoord % 2 === 0,
        fieldType,
        pieceType,
        isWhite,
        isSelected: selectedTile === relativeCoord,
        isMoveable: isMoveable,
        isRotated,
        isLastMove,
      });
    }
    tiles = isRotated ? tempTiles.reverse() : tempTiles;
    if (gameState?.gameResult) {
      const getResultMessage = (gameResult: GameResult) => {
        switch (gameResult) {
          case GameResult.WhiteWins:
            return "White won!";
          case GameResult.BlackWins:
            return "Black won!";
          case GameResult.Tie:
            return "Draw!";
        }
      };
      alert(getResultMessage(gameState?.gameResult));
    }
  };

  export let gameId: string;

  let tiles: TileData[] = [];
  let selectedTile: number | undefined;
  let lockSelection: boolean;
  let autoRotation = false;
  let isRotated = false;
  let gameState: GameState;
  let gameInfo: GameInfo;
  let ws: WebSocket;
  let playerType: PlayerType;
  let moveNotations: string[];
  $: moveNotations = getMoveNotations(gameState?.moveHistory);
  $: gameState, selectedTile, autoRotation, render();

  onMount(() => {
    ws = new WebSocket(`ws://${BACKEND_URL}:${BACKEND_PORT}/game/${gameId}`);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if ("playerType" in data) {
        playerType = data.playerType;
      } else if ("phase" in data) {
        gameState = data as GameState;
      } else if ("id" in data) {
        gameInfo = data as GameInfo;
      }
    };
  });
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
    <Toolbar bind:autoRotation activeGame={!gameState} />
    <!-- <PiecePicker on:pieceSelection={selectPiece} /> -->
  </div>
  <div class="info">
    <h2>INFO</h2>
    <table style="width:100%">
      {#if gameState && gameInfo}
        <tr>
          <th>White</th>
          <td>{gameInfo.whiteUsername}</td>
        </tr>
        <tr>
          <th>Black</th>
          <td>{gameInfo.blackUsername}</td>
        </tr>
        <tr>
          <th>Role</th>
          <td>{PlayerType[playerType]}</td>
        </tr>
        <tr>
          <th>Game mode</th>
          <td>{GameMode[gameInfo.mode]}</td>
        </tr>
        <tr>
          <th>Next player</th>
          <td>{gameState?.nextPlayerIsWhite ? "White" : "Black"}</td>
        </tr>
        <tr>
          <!-- <th>Moves</th> -->
        </tr>
        <ul>
          {#each moveNotations as moveNotation}
            <li>{moveNotation}</li>
          {/each}
        </ul>
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

    .info {
      padding: 10px;
      margin: 5px 0 0 -85px;
      border: 2px dashed black;
      max-height: 700px;
      min-width: 300px;

      font-size: 18px;
      line-height: 24px;
      font-family: "Courier New", Courier, monospace;

      h2 {
        text-align: center;
      }
      th {
        text-align: left;
      }
      td {
        text-align: right;
      }
    }
  }
</style>
