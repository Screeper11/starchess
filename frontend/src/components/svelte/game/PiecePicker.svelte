<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { PieceType } from "../../../../typesCopy";
  // TODO finish this
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

  const handleHover = (event: MouseEvent) => {
    for (const card of document.getElementsByClassName("card")) {
      // TODO svelte solution instead of document.getElements
      const rect = card.getBoundingClientRect(),
        x = event.clientX - rect.left,
        y = event.clientY - rect.top;

      card.style.setProperty("--mouse-x", `${x}px`);
      card.style.setProperty("--mouse-y", `${y}px`);
    }
  };
</script>

<div class="container">
  <div id="cards" on:mousemove={handleHover}>
    {#each pieces as piece}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div class="card" on:click={() => selectPiece(piece)}>
        <div class="card-content">
          <div
            class="piece"
            style="--piece-url: url('/src/assets/pieces/white_{PieceType[
              piece
            ].toLowerCase()}.svg')"
          />
        </div>
      </div>
    {/each}
  </div>
</div>

<style lang="scss">
  .piece {
    background-image: var(--piece-url);
    background-repeat: no-repeat;
    background-position: center;
    height: 100%;
    width: 100%;
    background-size: 80%;
  }

  .container {
    position: absolute;
    top: 100px;
    left: 100px;

    // align-items: center;
    // background-color: rgb(20, 20, 20);
    // display: flex;
    // height: 100vh;
    // justify-content: center;
    // margin: 0px;
    overflow: hidden;
    // padding: 0px;
  }

  #cards {
    display: flex;
    flex-wrap: wrap;
    // display: grid;
    // grid-template-columns: 200px 200px;
    // grid-row: auto auto;
    gap: 8px;
    // max-width: 916px;
    width: 50%;
  }

  #cards:hover > .card::after {
    opacity: 1;
  }

  .card {
    // flex-basis: 40%;

    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    cursor: pointer;
    display: flex;
    height: 200px;
    // flex-direction: column;
    position: relative;
    width: 200px;
  }

  .card:hover::before {
    opacity: 1;
  }

  .card::before,
  .card::after {
    border-radius: inherit;
    content: "";
    height: 100%;
    left: 0px;
    opacity: 0;
    position: absolute;
    top: 0px;
    transition: opacity 500ms;
    width: 100%;
  }

  .card::before {
    background: radial-gradient(
      800px circle at var(--mouse-x) var(--mouse-y),
      rgba(0, 0, 0, 0.06),
      transparent 40%
    );
    z-index: 3;
  }

  .card::after {
    background: radial-gradient(
      600px circle at var(--mouse-x) var(--mouse-y),
      rgba(0, 0, 0, 0.4),
      transparent 40%
    );
    z-index: 1;
  }

  .card > .card-content {
    background-color: rgb(242, 252, 255);
    border-radius: inherit;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    inset: 1px;
    padding: 10px;
    position: absolute;
    z-index: 2;
  }
</style>
