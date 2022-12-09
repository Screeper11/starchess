<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { PieceType } from "../../../../typesCopy";

  const pieces = [
    PieceType.Queen,
    PieceType.Knight,
    PieceType.Bishop,
    PieceType.Rook,
  ];

  const dispatch = createEventDispatcher();

  const selectPiece = (piece: PieceType) => {
    dispatch("pieceSelection", {
      selectedPiece: piece,
    });
  };
</script>

<div class="container">
  {#each pieces as piece}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="card" on:click={() => selectPiece(piece)}>
      <div
        class="piece"
        style="--piece-url: url('/src/assets/pieces/white_{PieceType[
          piece
        ].toLowerCase()}.svg')"
      />
    </div>
  {/each}
</div>

<style lang="scss">
  $background-color: #eaf6fa;
  $border-color: #627277;
  $background-color-hover: #c7e9f5;

  $card-size: 100px;

  .container {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    top: 100px;
    left: 100px;

    .card {
      width: $card-size;
      height: $card-size;
      background-color: $background-color;
      margin: 2px;
      border: solid 1px $border-color;
      border-radius: 4px;

      transition: all 0.2s ease-in-out;

      &:hover {
        cursor: pointer;
        background-color: $background-color-hover;
      }

      .piece {
        background-image: var(--piece-url);
        background-repeat: no-repeat;
        background-position: center;
        height: 100%;
        width: 100%;
        background-size: 80%;
      }
    }
  }
</style>
