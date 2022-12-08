<script lang="ts">
  import { onMount } from "svelte";
  import Clipboard from "svelte-clipboard";

  const toastShowTime = 2000;

  let urlField: HTMLInputElement;
  let url: string;
  let showToast = false;

  onMount(() => (url = window.location.href));
</script>

<div class="copy-url">
  <div class="label">Share URL</div>
  <input
    bind:this={urlField}
    class="url-field"
    type="text"
    value={url}
    readonly
    on:click={() => {
      urlField.select();
    }}
  />

  <Clipboard text={url} let:copy>
    <button
      class="copy-button"
      on:click={() => {
        copy();
        showToast = true;
        setTimeout(() => {
          showToast = false;
        }, toastShowTime);
      }}>Copy</button
    >
  </Clipboard>

  <div class="toast-container" class:hidden={!showToast}>
    <div class="toast">Copied!</div>
  </div>
</div>

<style lang="scss">
  $height: 36px;

  .copy-url {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: start;
    width: 850px;

    .label {
      font-weight: normal;
      font-size: 14px;
      position: relative;
      text-align: center;
      white-space: nowrap;
      user-select: none;
    }

    .url-field {
      margin: 0 4px 0 12px;
      width: 550px;
      height: $height - 4px;
      padding: 0 8px;
    }

    .copy-button {
      width: 80px;
      height: $height;
    }

    .toast {
      margin: 8px;

      &-container {
        transition: opacity 0.5s;
        transition-duration: 0.2s, 1s;
      }

      &-container.hidden {
        opacity: 0;
      }
    }
  }
</style>
