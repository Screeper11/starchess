<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { PieceType } from "../../../../../backend/gameServer/src/helpers/types";
  import { FieldType, TileData } from "./types";

  export let tileData: TileData;
  let disabled: boolean;

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
  class="tile {tileData.isEven ? 'even' : ''}
  {tileData.pieceType !== null ? 'empty' : ''}
  {tileData.isSelected ? 'selected' : ''}
  {tileData.isMoveable ? 'moveable' : ''}
  {tileData.isLastMove ? 'last-moved' : ''}
  {FieldType[tileData.fieldType].toLowerCase()}
{tileData.isRotated ? 'rotated' : ''}"
  on:click={selectTile}
>
  <div class="tile-content">
    {#if tileData.pieceType !== null && tileData.isWhite !== null}
      <div
        class="piece {tileData.isSelected ? 'selected' : ''}"
        style="--piece-url: url('/src/assets/pieces/{tileData.isWhite
          ? 'white'
          : 'black'}_{PieceType[tileData.pieceType].toLowerCase()}.svg')"
      />
    {/if}
    <div class="number {tileData.fieldType}">
      {tileData.relativeCoord}
    </div>
  </div>
</div>

<style lang="scss">
  $primary-color: rgb(156, 207, 224);
  .tile {
    display: inline-block;
    width: calc(var(--s) * 1.1547);

    margin: var(--m);
    height: var(--s);
    clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
    background-color: $primary-color;
    margin-left: calc(var(--m) - var(--s) * 0.2885);
    user-select: none;

    &.rotated {
      position: relative;
      right: calc(var(--s) * 0.866 + var(--m) * 2);
    }

    &:hover {
      // background-color: darken($primary-color, 15%);
    }

    &:not(.empty):hover {
      // cursor: grab;
    }

    &:not(.empty):active {
      // cursor: grabbing;
    }

    &.even {
      position: relative;
      &:not(.rotated) {
        top: calc(var(--s) / 2 + var(--m));
      }
      &.rotated {
        bottom: calc(var(--s) / 2 + var(--m));
      }
    }

    &.hide {
      visibility: hidden;
    }

    &.moveable {
      cursor: pointer;
      background-color: lighten($primary-color, 10%);
      transition: all 0.2s ease-in-out;
    }

    &.ghost {
      background-color: transparent !important;
      color: transparent;
      user-select: none;
    }

    &.last-moved {
      background-color: darken($primary-color, 10%);
    }
  }

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
      filter: drop-shadow(0 0 8px black);
    }
  }

  .number {
    position: absolute;
    bottom: var(--m);

    left: calc(var(--s) * 1.1547 / 4 + var(--m));
    font-size: 14px;

    font-weight: bold;
    font-family: Helvetica, Arial, sans-serif, Tahoma, Geneva, Verdana,
      sans-serif;
  }
</style>
