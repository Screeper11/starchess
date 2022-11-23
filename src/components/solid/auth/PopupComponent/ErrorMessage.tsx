function ErrorMessage(props: { error: string }) {

  return (
    <span class="error-message">{props.error}</span>
  );
}

export default ErrorMessage;
