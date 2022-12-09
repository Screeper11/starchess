<script lang="ts">
  import { coordMap, boardHeight, boardWidth } from "./constants";
  import { FieldType, TileData } from "./types";
  import {
    BackRanks,
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
  import { BACKEND_URL } from "./../../../../env";

  function sendMove(
    startTile: number,
    endTile: number,
    promotionPiece?: PieceType
  ) {
    console.log(`Sending move: ${startTile} -> ${endTile}`);
    const moveRequestData: Move = {
      startTile,
      endTile,
      promotionPiece: promotionPiece || null,
    };
    ws.send(JSON.stringify(moveRequestData));
    selectedTile = undefined;
    selectedPiece = null;
  }

  function tryToMove(
    startTile: number | undefined,
    endTile: number | undefined,
    selectedPiece?: PieceType
  ) {
    if (!startTile || !endTile) return;
    if (isMovePromotion(startTile, endTile)) {
      // move is promotion
      if (!selectedPiece) {
        // no promotion piece selected, can't send move yet
        console.log("no promotion piece selected, can't send move yet");
        promotionInProgress = true;
        return;
      }
      // promotion piece selected, sending promotion move
      console.log("promotion piece selected, sending promotion move");
      sendMove(startTile, endTile, selectedPiece);
      return;
    } else {
      // move is not promotion, sending a normal move
      console.log("move is not promotion, sending a normal move");
      sendMove(startTile, endTile);
      return;
    }
  }

  function isMovePromotion(startTile: number, endTile: number): boolean {
    const backRanks: BackRanks = {
      white: [10, 16, 21, 27, 34],
      black: [4, 11, 17, 22, 28],
    };

    // if piece is pawn
    if (gameState?.gamePosition[startTile]?.pieceType === PieceType.Pawn) {
      // if pawn is on back rank
      if (
        (backRanks.white.includes(endTile) &&
          gameState?.gamePosition[startTile]?.isWhite) ||
        (backRanks.black.includes(endTile) &&
          !gameState?.gamePosition[startTile]?.isWhite) ||
        true // TODO delete
      ) {
        return true;
      }
    }
    return false;
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
      return;
    }

    if (!gameState?.legalMoves[selectedTile]?.includes(clickedTile)) {
      // illegal move
      cancelSelection();
      return;
    }

    startTile = selectedTile;
    endTile = clickedTile;
  };

  const cancelSelection = () => {
    if (lockSelection) {
      lockSelection = false;
      return;
    }
    selectedTile = undefined;
  };

  const selectPiece = (event: CustomEvent) => {
    selectedPiece = event.detail.selectedPiece;
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
  let startTile: number | undefined;
  let endTile: number | undefined;
  let selectedPiece: PieceType | null = null;
  let promotionInProgress = false;
  let lockSelection: boolean;
  let autoRotation = false;
  let isRotated = false;
  let gameState: GameState;
  let gameInfo: GameInfo;
  let ws: WebSocket;
  let playerType: PlayerType;
  $: gameState, selectedTile, autoRotation, render();
  $: startTile,
    endTile,
    selectedPiece,
    tryToMove(startTile, endTile, selectedPiece || null);

  onMount(() => {
    const wsAddress = `wss://${BACKEND_URL}/game/${gameId}`;
    ws = new WebSocket(wsAddress);
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

    let connectionFailCount = 0;
    setInterval(() => {
      switch (ws.readyState) {
        case WebSocket.OPEN:
          ws.send("ping");
          break;
        case WebSocket.CLOSED:
          if (connectionFailCount < 3) {
            try {
              ws = new WebSocket(wsAddress);
            } catch (e) {
              console.error("WebSocket connection failed, retrying...");
              connectionFailCount++;
            }
          } else {
            alert("Connection failed, please try again later");
          }
          break;
      }
    }, 10000);
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
    {#if promotionInProgress}
      <div class="floating-box">
        <PiecePicker on:pieceSelection={selectPiece} />
      </div>
    {/if}
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
        <!-- TODO delete below -->
        <tr>
          <th>Promotion in progress</th>
          <td>{promotionInProgress}</td>
        </tr>
        <tr>
          <th>Start tile</th>
          <td>{startTile}</td>
        </tr>
        <tr>
          <th>End tile</th>
          <td>{endTile}</td>
        </tr>
        <tr>
          <th>Selected piece</th>
          <td>{PieceType[selectedPiece]}</td>
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
      margin: 5px 0 0 -130px;
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

    .floating-box {
      display: inline-block;
      position: absolute;
      top: 100;
      left: 100;
    }
  }
</style>
