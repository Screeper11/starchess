<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { TileData } from "./constants";

  export let tileData: TileData;

  const dispatch = createEventDispatcher();

  // TODO drag'n'drop
  const selectTile = () => {
    dispatch("tileSelection", {
      tileNumber: tileData.relativeCoord,
    });
  };
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
  class="tile {tileData.evenOrOdd}
  {tileData.fieldType}
{tileData.piece === undefined ? 'empty' : 'not-empty'}
{tileData.isSelected ? 'selected' : ''}
{tileData.canMove ? 'moveable' : 'not-moveable'}"
  on:click={selectTile}
>
  <div class="tile-content">
    {#if tileData.piece != undefined}
      <div
        class="piece {tileData.isSelected ? 'selected' : ''}"
        style="--piece-url: url('/src/assets/pieces/{tileData.piece}.svg')"
      />
    {/if}
    <div class="number {tileData.fieldType}">
      {tileData.relativeCoord}
    </div>
  </div>
</div>

<style lang="scss">
  .tile {
    display: inline-block;
    width: calc(var(--s) * 1.1547);

    margin: var(--m);
    height: var(--s);
    clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
    background-color: rgb(156, 207, 224);
    margin-left: calc(var(--m) - var(--s) * 0.2885);
    user-select: none;

    &:hover {
      /* background-color: rgb(146, 189, 204); */
    }

    &:not(.empty):hover {
      cursor: grab;
    }

    &:not(.empty):active {
      cursor: grabbing;
    }

    &.even {
      position: relative;
      top: calc(var(--s) / 2 + var(--m));
    }

    &.hide {
      visibility: hidden;
      background-color: rgb(51, 138, 167);
    }

    &.ghost {
      background-color: transparent;
    }

    &.moveable {
      cursor: pointer;
      background-color: rgb(200, 232, 243);

      transition: all 0.2s ease-in-out;
    }
  }

  /* .not-moveable {
    background-color: rgb(117, 165, 182);
  } */

  .tile-content {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .piece {
    position: absolute;

    background-image: var(--piece-url);
    background-repeat: no-repeat;
    background-position: center;
    height: 100%;
    width: 100%;
    background-size: 60%;

    &.selected {
      filter: drop-shadow(0 0 5px black); /* no blur */
    }
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

    &.ghost {
      color: transparent;
      user-select: none;
    }
  }
</style>
