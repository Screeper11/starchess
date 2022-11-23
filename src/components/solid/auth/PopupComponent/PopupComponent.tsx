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
          <div>
            <p>New here?</p>
            <p onClick={() => (setUserexists(false))}>
              Sign up
            </p>
          </div>
          :
          <div>
            <p>Already have an account?</p>
            <p onClick={() => (setUserexists(true))}>
              Log In
            </p>
          </div>
        }
      </div>
    </div>
  );
};

export default PopupComponent;
