<script lang="ts">
  import ToggleSwitch from "./ToggleSwitch.svelte";
  import UrlShare from "./urlShare.svelte";

  export let autoRotation: boolean;
  export let activeGame: boolean;
</script>

<div class="toolbar">
  <ToggleSwitch
    label={"Auto rotation"}
    disabled={activeGame}
    on:click={() => {
      autoRotation = !autoRotation;
    }}
  />
  <UrlShare />
</div>

<style lang="scss">
  .toolbar {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: start;
  }
</style>
