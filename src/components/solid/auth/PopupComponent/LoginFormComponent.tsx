import { createStore } from "solid-js/store";
import { hashPassword, logIn, useForm } from "./logic";
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
    // <form use:formSubmit={submitSignUp}>
    <div class="form">
      <h2>Log In</h2>
      <div class="field-block">
        <input name="username" type="text" placeholder="Username"
          required onInput={(e) => setFields("username", e.target.value)}
          use:validate />
        {errors.username && <ErrorMessage error={errors.username} />}
      </div>
      <div class="field-block">
        <input type="password" name="password" placeholder="Pasword"
          required minlength="4" onInput={(e) => setFields("password", e.target.value)}
          use:validate />
        {errors.password && <ErrorMessage error={errors.password} />}
      </div>
      <button type="submit" disabled={Object.values(errors).some(Boolean)}
        onClick={submitLogin}>Log In</button>
    </div>
    // </form>
  );
};


export default LoginFormComponent;
