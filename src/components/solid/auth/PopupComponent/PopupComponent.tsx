import { createStore } from "solid-js/store";
import { useForm } from "./validation";
import "./styles.scss";

const ErrorMessage = (props: { error: any; }) => <span class="error-message">{props.error}</span>;

function PopupComponent() {
  const { validate, formSubmit, errors } = useForm({
    errorClass: "error-input"
  });
  const [fields, setFields] = createStore();
  const fn = (form: any) => {
    // form.submit()
    console.log("Done");
  };
  const usernameExists = async ({ value: username }) => {
    const usernameExists = (await fetch(`https://localhost:4001/api/userExists/`,
      { body: JSON.stringify({ username }) })).json();
    return usernameExists && `${username} is already being used`;
  };

  const matchesPassword = ({ value }) =>
    value === fields.password ? false : "Passwords must Match";

  return (
    <div class="popup">
      <form use:formSubmit={fn}>
        <h2>Sign Up</h2>
        <div class="field-block">
          <input
            name="username"
            type="text"
            placeholder="Username"
            required
            use:validate={[usernameExists]}
          />
          {errors.username && <ErrorMessage error={errors.username} />}
        </div>
        <div class="field-block">
          <input
            type="password"
            name="password"
            placeholder="Password"
            required=""
            minlength="8"
            onInput={(e: { target: { value: any; }; }) => setFields("password", e.target.value)}
            use:validate
          />
          {errors.password && <ErrorMessage error={errors.password} />}
        </div>
        <div class="field-block">
          <input
            type="password"
            name="confirmpassword"
            placeholder="Confirm Password"
            required
            use:validate={[matchesPassword]}
          />
          {errors.confirmpassword && (
            <ErrorMessage error={errors.confirmpassword} />
          )}
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default PopupComponent;
