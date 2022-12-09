import { createStore } from "solid-js/store";
import { signUp, useForm } from "./logic";
import ErrorMessage from "./ErrorMessage";
import { BACKEND_URL } from "./../../../../../env";
import { createSignal } from "solid-js";

function SignupFormComponent() {
  const { validate, formSubmit, errors } = useForm({
    errorClass: "error-input"
  });

  const [formSubmitted, setFormSubmitted] = createSignal(false);

  const [fields, setFields] = createStore({
    username: "",
    password: "",
    confirmPassword: "",
  });

  const submitSignUp = async () => {
    if (formSubmitted()) return;
    signUp(fields.username, fields.password);
    setFormSubmitted(true);
  };

  const usernameExists = async ({ value: username }): Promise<String> => {
    if (formSubmitted()) return Promise.resolve("");
    const res = await fetch(`https://${BACKEND_URL}/userExists/${username}`);
    const { userExists } = await res.json();
    return userExists && `${username} is already being used`;
  };

  const matchesPassword = ({ value }) => {
    return value === fields.password ? false : "Passwords must Match";
  }

  return (
    <form use:formSubmit={submitSignUp}>
      <h2>Sign Up</h2>
      <div class="field-block">
        <input name="username" type="text" placeholder="Username" autocomplete="username"
          required onInput={(e) => setFields("username", (e.target as HTMLInputElement).value)}
          use:validate={[usernameExists]} />
        {errors.username && <ErrorMessage error={errors.username} />}
      </div>
      <div class="field-block">
        <input type="password" name="password" placeholder="Password" autocomplete="new-password"
          required minlength="4" onInput={(e) => setFields("password", (e.target as HTMLInputElement).value)}
          use:validate />
        {errors.password && <ErrorMessage error={errors.password} />}
      </div>
      <div class="field-block">
        <input type="password" name="confirmPassword" placeholder="Confirm Password" autocomplete="new-password"
          required onInput={(e) => setFields("confirmPassword", (e.target as HTMLInputElement).value)}
          use:validate={[matchesPassword]} />
        {errors.confirmPassword && (<ErrorMessage error={errors.confirmPassword} />)}
      </div>
      <button type="submit" disabled={Object.values(errors).some(Boolean) || !fields.username || !fields.password || !fields.confirmPassword}
        onClick={submitSignUp}>Sign Up</button>
    </form>
  );
};

export default SignupFormComponent;
