import PopupComponent from "./PopupComponent/PopupComponent.jsx";
import { createSignal, JSXElement } from "solid-js";

const iconPath = "./../src/assets/icons";
const profileIcon = `${iconPath}/profileIcon.svg`;
const profileIconLoggedIn = `${iconPath}/profileIconLoggedIn.svg`;

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
      <div style={styleSheet.container} onClick={handleClick}>
        <img src={getUsername() ? profileIconLoggedIn : profileIcon}
          style={styleSheet.profileIcon} alt="profile" />
      </div>
      <div>
        {getShowPopup() && <PopupComponent username={getUsername()} />}
      </div>
    </>
  );
}

const styleSheet = {
  container: {
    height: "100%",
    width: "100%",
  },
  profileIcon: {
    margin: "auto",
    width: "100%",
    height: "100%",
    cursor: "pointer",
  },
}

export default AuthComponent;
