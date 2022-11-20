import PopupComponent from "./PopupComponent/PopupComponent.jsx";
import { createSignal, JSXElement } from "solid-js";

function AuthComponent(): JSXElement {
  const [getShowPopup, setShowPopup] = createSignal(true); // TODO false

  const handleClick = () => {
    setShowPopup(!getShowPopup());
  };

  return (
    <>
      <div onClick={handleClick}>
        <img src={"src/assets/icons/profileIcon.svg"} style={styleSheet.profileIcon} alt="profile" />
      </div>
      <div>
        {getShowPopup() && <PopupComponent />}
      </div>
    </>
  );
}

const styleSheet = {
  profileIcon: {
    width: "80%",
    cursor: "pointer",
  },
}

export default AuthComponent;
