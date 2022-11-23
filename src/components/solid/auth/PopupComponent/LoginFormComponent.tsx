import { createStore } from "solid-js/store";
import { useForm } from "./validation";
import { baseUrl, authPort } from "../../../../config";
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
    const res = await fetch(`${baseUrl}:${authPort}/login`, {
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

  return (
    <form use:formSubmit={submitLogin}>
      <h2>Log In</h2>
      <div class="field-block">
        <input name="username" type="text" placeholder="Username"
          required use:validate />
        {errors.username && <ErrorMessage error={errors.username} />}
      </div>
      <div class="field-block">
        <input type="password" name="password" placeholder="Pasword"
          required minlength="4" onInput={(e) => setFields("password", e.target.value)}
          use:validate />
        {errors.password && <ErrorMessage error={errors.password} />}
      </div>
      <button type="submit" disabled={Object.values(errors).some(Boolean)}>Log In</button>
    </form>
  );
};


export default LoginFormComponent;
