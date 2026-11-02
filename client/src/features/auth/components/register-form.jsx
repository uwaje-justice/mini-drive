import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import Button from "@/components/ui/button.jsx";
import Field from "@/components/ui/field.jsx";
import FormAlert from "@/components/ui/form-alert.jsx";
import applyApiError from "@/features/auth/apply-api-error.js";
import PasswordField from "@/features/auth/components/password-field.jsx";
import useRegister from "@/features/auth/hooks/use-register.js";

const RegisterForm = () => {
  const registerUser = useRegister();
  const navigate = useNavigate();
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
      confirmPassword: "",
    },
  });

  const onSubmit = async (values) => {
    clearErrors();

    try {
      await registerUser.mutateAsync(values);
      navigate("/drive", { replace: true });
    } catch (error) {
      applyApiError(error, setError, [
        "email",
        "password",
        "confirmPassword",
      ]);
    }
  };

  const isBusy = isSubmitting || registerUser.isPending;

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
        autoComplete="new-password"
        placeholder="At least 8 characters"
        hint="Use 8 to 128 characters."
        error={errors.password?.message}
        {...register("password", {
          required: "Create a password.",
          minLength: {
            value: 8,
            message: "Password must be 8 to 128 characters.",
          },
          maxLength: {
            value: 128,
            message: "Password must be 8 to 128 characters.",
          },
        })}
      />

      <PasswordField
        label="Confirm password"
        autoComplete="new-password"
        placeholder="Repeat your password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword", {
          required: "Repeat your password.",
          validate: (value, values) =>
            value === values.password || "Passwords do not match.",
        })}
      />

      <Button
        type="submit"
        size="lg"
        className="mt-1 w-full"
        isLoading={isBusy}
      >
        Create account
      </Button>
    </form>
  );
};

export default RegisterForm;
