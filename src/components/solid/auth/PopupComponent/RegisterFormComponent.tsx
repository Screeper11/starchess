import { createStore } from "solid-js/store";
import { useForm } from "./validation";
import { baseUrl, authPort } from "../../../../config";
import ErrorMessage from "./ErrorMessage";

// TODO https://www.solidjs.com/guides/typescript#on___oncapture___

function SignupFormComponent() {
  const { validate, formSubmit, errors } = useForm({
    errorClass: "error-input"
  });

  const [fields, setFields] = createStore({
    username: "",
    password: "",
    confirmPassword: "",
  });

  const submitSignUp = async () => {
    console.log('submitSignUp');
    const res = await fetch(`${baseUrl}:${authPort}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: fields.username,
        password: fields.password,
      }),
    });
    const data = await res.json();
    console.log(data);
  };

  const usernameExists = async ({ value: username }) => {
    const res = await fetch(`${baseUrl}:${authPort}/userExists/${username}`);
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
        <input name="username" type="text" placeholder="Username"
          required use:validate={[usernameExists]} />
        {errors.username && <ErrorMessage error={errors.username} />}
      </div>
      <div class="field-block">
        <input type="password" name="password" placeholder="Pasword"
          required minlength="4" onInput={(e) => setFields("password", e.target.value)}
          use:validate />
        {errors.password && <ErrorMessage error={errors.password} />}
      </div>
      <div class="field-block">
        <input type="password" name="confirmPassword" placeholder="Confirm Password"
          required
          use:validate={[matchesPassword]} />
        {errors.confirmPassword && (<ErrorMessage error={errors.confirmPassword} />)}
      </div>
      <button type="submit" disabled={Object.values(errors).some(Boolean)}>Sign Up</button>
    </form>
  );
};

export default SignupFormComponent;
