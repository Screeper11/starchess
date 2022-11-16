<!-- https://codepen.io/alvarotrigo/pen/oNoJePo -->

<div class="toggle-button-cover">
  <div class="button r" id="switch">
    <input type="checkbox" class="checkbox" />
    <div class="knobs" />
    <div class="layer" />
  </div>
  <div class="label">Rotate table</div>
</div>

<style lang="scss">
  * {
    font-weight: bold;
    font-family: Helvetica, Arial, sans-serif, Tahoma, Geneva, Verdana,
      sans-serif;
    margin: 0;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    &:focus {
      outline: none;
    }
  }

  .label {
    font-weight: normal;
    font-size: 14px;
    position: relative;
    text-align: center;
    top: 80px;
  }

  .toggle-button-cover {
    display: table-cell;
    position: relative;
    width: 200px;
    height: 140px;
    box-sizing: border-box;
  }

  .knobs,
  .layer {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }

  .button {
    position: relative;
    top: 50%;
    width: 74px;
    height: 36px;
    margin: -20px auto 0 auto;
    overflow: hidden;
  }

  .button.r,
  .button.r .layer {
    border-radius: 100px;
  }

  .checkbox {
    position: relative;
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
    opacity: 0;
    cursor: pointer;
    z-index: 3;
  }

  .knobs {
    z-index: 2;
  }

  .layer {
    width: 100%;
    background-color: rgb(218, 239, 245);
    transition: 0.3s ease all;
    z-index: 1;
  }

  #switch {
    overflow: visible;

    & .knobs:before {
      content: "W";
      position: absolute;
      top: 4px;
      left: 4px;
      width: 20px;
      height: 14px;
      color: #fff;
      font-size: 14px;
      text-align: center;
      padding: 7px 4px;
      background-color: rgb(73, 142, 165);
      border-radius: 50%;
    }

    & .layer,
    & .knobs,
    & .knobs:before {
      transform: rotateZ(0);
      transition: 0.4s cubic-bezier(0.18, 0.89, 0.35, 1.15) all;
    }

    & .checkbox:checked + .knobs {
      transform: rotateZ(-180deg);
    }

    & .checkbox:checked + .knobs:before {
      content: "B";
      color: black;
      background-color: rgb(218, 239, 245);
      transform: rotateZ(180deg);
    }

    & .checkbox:checked ~ .layer {
      background-color: rgb(73, 142, 165);
      transform: rotateZ(180deg);
    }
  }
</style>
