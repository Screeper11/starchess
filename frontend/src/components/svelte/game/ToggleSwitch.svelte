<script lang="ts">
  export let label: string;
  export let disabled: boolean;
</script>

<div class="container">
  <label class="switch">
    <input type="checkbox" {disabled} on:click />
    <div class="slider" />
  </label>
  <p>{label}</p>
</div>

<style lang="scss">
  $off-color: #9ad4e7;
  $on-color: #498ea5;
  $disabled-color: #ccc;
  $button-color: #fff;

  .container {
    padding: 0 30px;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 80px;

    .switch {
      display: inline-block;
      height: 24px;
      position: relative;
      width: 48px;
      margin: 8px;

      input {
        display: none;

        &:disabled + .slider {
          background-color: $disabled-color;
          cursor: auto;
        }

        &:checked + .slider {
          background-color: $on-color;

          &:before {
            transform: translateX(24px);
          }
        }
      }

      .slider {
        background-color: $off-color;
        bottom: 0;
        cursor: pointer;
        left: 0;
        position: absolute;
        right: 0;
        top: 0;
        transition: all 0.3s;

        &:before {
          background-color: $button-color;
          bottom: 4px;
          content: "";
          height: 16px;
          left: 4px;
          position: absolute;
          transition: all 0.3s;
          width: 16px;
        }
      }
    }

    p {
      position: relative;
      margin: 0;
      text-align: center;
      font-family: Helvetica, Arial, sans-serif;
      font-weight: normal;
      font-size: 14px;
      user-select: none;
    }
  }
</style>
