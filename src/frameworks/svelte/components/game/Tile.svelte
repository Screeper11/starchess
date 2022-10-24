<script>
  export let tileData;
  export let piece;
</script>

<div
  class="tile {tileData.evenOrOdd} {tileData.showOrHide} 
{piece == undefined ? 'empty' : ''}"
>
  <div class="tile-content">
    {#if piece != undefined}
      <div
        class="piece"
        style="--piece-url: url('/src/assets/pieces/{piece}.svg')"
      />
    {/if}
    <div class="number">
      {tileData.relativeCoord}
    </div>
  </div>
</div>

<style>
  .tile {
    display: inline-block;
    width: calc(var(--s) * 1.1547);

    margin: var(--m);
    height: var(--s);
    clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
    background-color: rgb(156, 207, 224);
    margin-left: calc(var(--m) - var(--s) * 0.2885);
    user-select: none;

    transition: all 0.2s ease-in-out;
  }

  .tile:hover {
    background-color: rgb(146, 189, 204);
    /* transform: scale(0.9); */
  }

  .tile:not(.empty):hover {
    cursor: grab;
  }

  .tile:not(.empty):active {
    cursor: grabbing;
  }

  .tile-content {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .even {
    position: relative;
    top: calc(var(--s) / 2 + var(--m));
  }

  .hide {
    visibility: hidden;
  }

  .piece {
    background-image: var(--piece-url);
    background-repeat: no-repeat;
    background-position: center;
    height: 100%;
    background-size: 60%;
  }

  .number {
    position: absolute;
    bottom: var(--m);

    /* top: calc(var(--s) / 1.1547 - var(--m) * 2); */
    left: calc(var(--s) * 1.1547 / 4 + var(--m));
    font-size: 14px;

    font-weight: bold;
    font-family: Helvetica, Arial, sans-serif, Tahoma, Geneva, Verdana,
      sans-serif;
  }
</style>
