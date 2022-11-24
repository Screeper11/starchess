import PopupComponent from "./PopupComponent/PopupComponent.jsx";
import { createSignal, JSXElement } from "solid-js";

function AuthComponent(): JSXElement {
  const [getShowPopup, setShowPopup] = createSignal(false);
  const [getUsername, setUsername] = createSignal('');

  // poll every second to check if user is logged in
  setInterval(() => {
    setUsername(localStorage.getItem('username'));
  }, 1000);

  const handleClick = () => {
    setShowPopup(!getShowPopup());
  };

  return (
    <>
      <div onClick={handleClick}>
        <img src={getUsername() ? "src/assets/icons/profileIconLoggedIn.svg" : "src/assets/icons/profileIcon.svg"}
          style={styleSheet.profileIcon} alt="profile" />
      </div>
      <div>
        {getShowPopup() && <PopupComponent username={getUsername()} />}
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
