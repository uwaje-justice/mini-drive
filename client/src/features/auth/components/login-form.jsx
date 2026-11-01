import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";

import Button from "@/components/ui/button.jsx";
import Field from "@/components/ui/field.jsx";
import FormAlert from "@/components/ui/form-alert.jsx";
import applyApiError from "@/features/auth/apply-api-error.js";
import PasswordField from "@/features/auth/components/password-field.jsx";
import useLogin from "@/features/auth/hooks/use-login.js";

const LoginForm = () => {
  const login = useLogin();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    clearErrors,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values) => {
    clearErrors();

    try {
      await login.mutateAsync(values);
      const from =
        typeof location.state?.from === "string"
          ? location.state.from
          : "/drive";

      navigate(from, { replace: true });
    } catch (error) {
      applyApiError(error, setError, ["email", "password"]);
    }
  };

  const isBusy = isSubmitting || login.isPending;

  return (
    <form
      className="grid gap-5"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      {errors.root?.server?.message ? (
        <FormAlert>{errors.root.server.message}</FormAlert>
      ) : null}

      <Field
        label="Email"
        type="email"
        autoComplete="email"
        autoFocus
        placeholder="you@example.com"
        error={errors.email?.message}
        {...register("email", {
          required: "Enter your email.",
          pattern: {
            value: /^\S+@\S+\.\S+$/,
            message: "Enter a valid email address.",
          },
        })}
      />

      <PasswordField
        label="Password"
        autoComplete="current-password"
        placeholder="Enter your password"
        error={errors.password?.message}
        {...register("password", {
          required: "Enter your password.",
        })}
      />

      <Button
        type="submit"
        size="lg"
        className="mt-1 w-full"
        isLoading={isBusy}
      >
        Sign in
      </Button>
    </form>
  );
};

export default LoginForm;
