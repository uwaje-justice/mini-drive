const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FORM_TYPES = {
  login: {
    password: (value) => (value ? "" : "Password is required.")
  },
  register: {
    password: (value) => (
      value.length >= 8 && value.length <= 128
        ? ""
        : "Password must be 8 to 128 characters."
    )
  }
};

const getMessage = (input, form) => {
  const { name, value } = input;

  if (name === "email") {
    const email = value.trim();

    if (!email) {
      return "Email is required.";
    }

    return EMAIL_PATTERN.test(email) ? "" : "Enter a valid email.";
  }

  if (name === "password") {
    return form.matches('[data-auth-form="register"]')
      ? FORM_TYPES.register.password(value)
      : FORM_TYPES.login.password(value);
  }

  if (name === "confirmPassword") {
    return value === form.elements.password.value ? "" : "Passwords do not match.";
  }

  return "";
};

const setFieldError = (input, message) => {
  const form = input.form;
  const error = form?.querySelector(`[data-error-for="${input.name}"]`);

  input.setAttribute("aria-invalid", message ? "true" : "false");

  if (!error) {
    return;
  }

  error.textContent = message;
  error.hidden = !message;
};

const clearFormError = (form) => {
  const formError = form.querySelector("[data-form-error]");

  if (!formError || formError.hidden) {
    return;
  }

  const formErrorText = formError.querySelector("[data-form-error-text]");

  if (formErrorText) {
    formErrorText.textContent = "";
  }

  formError.hidden = true;
};

const setupForm = (form) => {
  const fields = Array.from(form.querySelectorAll("input[data-auth-field]"));
  const touched = new Set(
    fields
      .filter((input) => input.getAttribute("aria-invalid") === "true")
      .map((input) => input.name)
  );

  const validateField = (input) => {
    const message = getMessage(input, form);
    setFieldError(input, message);
    return message;
  };

  fields.forEach((input) => {
    input.addEventListener("blur", () => {
      touched.add(input.name);
      validateField(input);
    });

    input.addEventListener("input", () => {
      clearFormError(form);

      if (touched.has(input.name)) {
        validateField(input);
      }

      const confirmPassword = form.elements.confirmPassword;

      if (
        form.matches('[data-auth-form="register"]') &&
        input.name === "password" &&
        confirmPassword &&
        touched.has("confirmPassword")
      ) {
        validateField(confirmPassword);
      }
    });
  });

  form.addEventListener("submit", (event) => {
    const email = form.elements.email;

    if (email) {
      email.value = email.value.trim();
    }

    clearFormError(form);

    let firstInvalid = null;

    fields.forEach((input) => {
      touched.add(input.name);

      if (validateField(input) && !firstInvalid) {
        firstInvalid = input;
      }
    });

    if (firstInvalid) {
      event.preventDefault();
      firstInvalid.focus();
    }
  });
};

document.querySelectorAll("[data-auth-form]").forEach(setupForm);
