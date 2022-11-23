import { createSignal, Show } from "solid-js";
import LoginFormComponent from "./LoginFormComponent";
import SignupFormComponent from "./RegisterFormComponent";
import "./styles.scss";

function PopupComponent() {
  const [getUserExists, setUserexists] = createSignal(false);

  return (
    <div class="popup">
      {getUserExists() ? <LoginFormComponent /> : <SignupFormComponent />}
      <div>
        {getUserExists() ?
          <div class="cta">
            New here? <span onClick={() => (setUserexists(false))}>
              Sign up
            </span>
          </div> :
          <div class="cta">
            Already have an account? <span onClick={() => (setUserexists(true))}>
              Log In
            </span>
          </div>
        }
      </div>
    </div>
  );
};

export default PopupComponent;
