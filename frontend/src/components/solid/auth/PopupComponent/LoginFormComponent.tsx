import { createStore } from "solid-js/store";
import { logIn, useForm } from "./logic";
import ErrorMessage from "./ErrorMessage";

function LoginFormComponent() {
  const { validate, formSubmit, errors } = useForm({
    errorClass: "error-input"
  });

  const [fields, setFields] = createStore({
    username: "",
    password: "",
    confirmPassword: "",
  });

  const submitLogin = async () => {
    logIn(fields.username, fields.password);
  };

  return (
    <form use:formSubmit={submitLogin}>
      <h2>Log In</h2>
      <div class="field-block">
        <input name="username" type="text" placeholder="Username" autocomplete="username"
          required onInput={(e) => setFields("username", (e.target as HTMLInputElement).value)}
          use:validate />
        {errors.username && <ErrorMessage error={errors.username} />}
      </div>
      <div class="field-block">
        <input type="password" name="password" placeholder="Pasword" autocomplete="current-password"
          required minlength="4" onInput={(e) => setFields("password", (e.target as HTMLInputElement).value)}
          use:validate />
        {errors.password && <ErrorMessage error={errors.password} />}
      </div>
      <button type="submit" disabled={Object.values(errors).some(Boolean)}
        onClick={submitLogin}>Log In</button>
    </form>
  );
};

export default LoginFormComponent;
