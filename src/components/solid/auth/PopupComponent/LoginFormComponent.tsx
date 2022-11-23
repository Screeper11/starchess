function LoginFormComponent() {
  const fn = (form: any) => {
    // form.submit()
    console.log("Done");
  };

  return (
    <form use:formSubmit={fn}>
      <h2>Sign In</h2>
      <div class="field-block">
        <input type="text" placeholder="Username" />
      </div>
      <div class="field-block">
        <input type="password" placeholder="Password" />
      </div>
      <button type="submit">Submit</button>
    </form>
  );
};

export default LoginFormComponent;
