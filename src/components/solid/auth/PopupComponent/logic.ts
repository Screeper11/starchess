import { createStore } from "solid-js/store";
import { baseUrl, authPort } from "../../../../../config";

function checkValid({ element, validators = [] }, setErrors, errorClass) {
  return async () => {
    element.setCustomValidity("");
    element.checkValidity();
    let message = element.validationMessage;
    if (!message) {
      for (const validator of validators) {
        const text = await validator(element);
        if (text) {
          element.setCustomValidity(text);
          break;
        }
      }
      message = element.validationMessage;
    }
    if (message) {
      errorClass && element.classList.toggle(errorClass, true);
      setErrors({ [element.name]: message });
    }
  };
}

export function useForm({ errorClass }) {
  const [errors, setErrors] = createStore({
    username: "",
    password: "",
    confirmPassword: "",
  })
  const fields = {};

  const validate = (ref, accessor) => {
    const validators = accessor() || [];
    let config;
    fields[ref.name] = config = { element: ref, validators };
    ref.onblur = checkValid(config, setErrors, errorClass);
    ref.oninput = () => {
      if (!errors[ref.name]) return;
      setErrors({ [ref.name]: undefined });
      errorClass && ref.classList.toggle(errorClass, false);
    };
  };

  const formSubmit = (ref, accessor) => {
    const callback = accessor() || (() => { });
    ref.setAttribute("novalidate", "");
    ref.onsubmit = async (e) => {
      e.preventDefault();
      let errored = false;

      for (const k in fields) {
        const field = fields[k];
        await checkValid(field, setErrors, errorClass)();
        if (!errored && field.element.validationMessage) {
          field.element.focus();
          errored = true;
        }
      }
      !errored && callback(ref);
    };
  };

  return { validate, formSubmit, errors };
}

export function hashPassword(password: string): string {
  // TODO implement
  return password;
}

export async function logIn(username: string, password: string) {
  const res = await fetch(`${baseUrl}:${authPort}/login`, {
    method: "POST",
    body: JSON.stringify({
      username: username,
      passwordHash: hashPassword(password),
    }),
  });
  if (res.status !== 200) {
    console.log("Login failed");
    return;
  }
  const data = await res.json();
  localStorage.setItem("token", data.token);
  localStorage.setItem("username", data.username);
}

export async function logOut() {
  // TODO api call to invalidate token
  const res = await fetch(`${baseUrl}:${authPort}/logout`, {
    method: "POST",
    body: JSON.stringify({
      token: localStorage.getItem("token"),
    }),
  });
  if (res.status !== 200) {
    console.log("Logout failed");
    return;
  }
  localStorage.removeItem("token");
  localStorage.removeItem("username");

  // localStorage.setItem("token", "");
  // localStorage.setItem("username", "");
}
