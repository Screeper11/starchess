import { createStore } from "solid-js/store";
import { useForm } from "./validation";
import { baseUrl, authPort } from "../../../../config";
import ErrorMessage from "./ErrorMessage";

function SignupFormComponent() {
  const { validate, formSubmit, errors } = useForm({
    errorClass: "error-input"
  });
  const [fields, setFields] = createStore();
  const fn = (form: any) => {
    // form.submit()
    console.log("Done");
  };
  const usernameExists = async ({ value: username }) => {
    const res = await fetch(`${baseUrl}:${authPort}/userExists/${username}`);
    const { userExists } = await res.json();
    return userExists && `${username} is already being used`;
  };

  const matchesPassword = ({ value }) =>
    value === fields.password ? false : "Passwords must Match";

  return (
    <form use:formSubmit={fn}>
      <h2>Sign Up</h2>
      <div class="field-block">
        <input name="username" type="text" placeholder="Username" required use:validate={[usernameExists]} />
        {errors.username &&
          <ErrorMessage error={errors.username} />}
      </div>
      <div class="field-block">
        <input type="password" name="password" placeholder="Password" required="" minlength="8" onInput={(e: {
          target: {
            value: any;
          };
        }) => setFields("password", e.target.value)}
          use:validate
        />
        {errors.password &&
          <ErrorMessage error={errors.password} />}
      </div>
      <div class="field-block">
        <input type="password" name="confirmpassword" placeholder="Confirm Password" required
          use:validate={[matchesPassword]} />
        {errors.confirmpassword && (
          <ErrorMessage error={errors.confirmpassword} />
        )}
      </div>
      <button type="submit">Submit</button>
    </form>
  );
};

export default SignupFormComponent;
