import { createSignal, Show } from "solid-js";
import { logOut } from "./logic";
import LoginFormComponent from "./LoginFormComponent";
import SignupFormComponent from "./RegisterFormComponent";
import "./styles.scss";

function PopupComponent(props: { username: string }) {
  const [getUserExists, setUserexists] = createSignal(false);

  return (
    <div class="popup">
      {props.username ?
        <div>
          <h2>Profile</h2>
          <p>Logged in as <strong>{props.username}</strong></p>
          <div class="cta">
            <button onClick={logOut}>
              Log Out
            </button>
          </div>
        </div>
        :
        <div>
          {getUserExists() ? <LoginFormComponent /> : <SignupFormComponent />}
          <div>
            {getUserExists() ?
              (<div class="cta">
                New here? <span onClick={() => (setUserexists(false))}>
                  Sign up
                </span>
              </div>) :
              (<div class="cta">
                Already have an account? <span onClick={() => (setUserexists(true))}>
                  Log In
                </span>
              </div>)}
          </div>
        </div>
      }
    </div>
  );
};

export default PopupComponent;
