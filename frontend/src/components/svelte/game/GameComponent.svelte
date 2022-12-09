<script lang="ts">
  import { coordMap, boardHeight, boardWidth } from "./constants";
  import { FieldType, TileData } from "./types";
  import {
    backRanks,
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
    selectedPiece?: PieceType | null
  ) {
    if (!startTile || !endTile) return;
    if (isMovePromotion(startTile, endTile)) {
      if (!selectedPiece) {
        // no promotion piece selected, can't send move yet
        promotionInProgress = true;
        return;
      }
      // promotion piece selected, sending promotion move
      sendMove(startTile, endTile, selectedPiece);
      return;
    } else {
      // move is not promotion, sending a normal move
      sendMove(startTile, endTile);
      return;
    }
  }

  function isMovePromotion(startTile: number, endTile: number): boolean {
    const pieceIsPawn =
      gameState?.gamePosition[startTile]?.pieceType === PieceType.Pawn;
    const pawnIsOnBackRankForWhite =
      backRanks.white.includes(endTile) &&
      gameState?.gamePosition[startTile]?.isWhite;
    const pawnIsOnBackRankForBlack =
      backRanks.black.includes(endTile) &&
      !gameState?.gamePosition[startTile]?.isWhite;

    return (
      pieceIsPawn && (pawnIsOnBackRankForWhite || pawnIsOnBackRankForBlack)
    );
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

    endTilePosX = event.detail.posX;
    endTilePosY = event.detail.posY;
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
    promotionInProgress = false;
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
      const isTechnicallyCanMoveTo =
        !!selectedTile &&
        gameState?.legalMoves[selectedTile]?.includes(relativeCoord);
      const playerIsWhiteAndTheirTurn =
        gameState?.nextPlayerIsWhite && playerType === PlayerType.White;
      const playerIsBlackAndTheirTurn =
        !gameState?.nextPlayerIsWhite && playerType === PlayerType.Black;
      const canMoveTo =
        isTechnicallyCanMoveTo &&
        (playerIsWhiteAndTheirTurn || playerIsBlackAndTheirTurn);
      const currentTile = gameState?.gamePosition[relativeCoord];
      const pieceType =
        currentTile?.pieceType !== undefined ? currentTile?.pieceType : null;
      const isWhite =
        currentTile?.isWhite !== undefined ? currentTile?.isWhite : null;
      const isTechnicallyMoveable =
        gameState?.legalMoves[relativeCoord]?.length > 0;
      const playerTurnPieceAllWhite = playerIsWhiteAndTheirTurn && isWhite;
      const playerTurnPieceAllBlack = playerIsBlackAndTheirTurn && !isWhite;
      const isMoveable =
        isTechnicallyMoveable &&
        (playerTurnPieceAllWhite || playerTurnPieceAllBlack);
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
        canMoveTo,
        isMoveable,
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
  let endTilePosX = 0;
  let endTilePosY = 0;
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
    tryToMove(startTile, endTile, selectedPiece);

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
    {#if promotionInProgress && playerType !== PlayerType.Spectator}
      <div
        class="floating-box"
        style="--pos-x: {endTilePosX}px; --pos-y: {endTilePosY}px"
      >
        <PiecePicker
          on:pieceSelection={selectPiece}
          isWhite={playerType === PlayerType.White}
        />
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
      top: var(--pos-y);
      left: var(--pos-x);
    }
  }
</style>
