import { useState } from "react";
import { useForm } from "react-hook-form";

import Button from "@/components/ui/button.jsx";
import Field from "@/components/ui/field.jsx";
import FormAlert from "@/components/ui/form-alert.jsx";
import FormSuccess from "@/components/ui/form-success.jsx";
import applyApiError from "@/features/auth/apply-api-error.js";
import PasswordField from "@/features/auth/components/password-field.jsx";
import useUpdateEmail from "@/features/auth/hooks/use-update-email.js";

const EmailForm = ({ email }) => {
  const updateEmail = useUpdateEmail();
  const [message, setMessage] = useState("");
  const {
    clearErrors,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm({
    defaultValues: {
      email,
      currentPassword: "",
    },
  });

  const onSubmit = async (values) => {
    clearErrors();
    setMessage("");

    try {
      const session = await updateEmail.mutateAsync(values);

      reset({ email: session.user.email, currentPassword: "" });
      setMessage("Email updated.");
    } catch (error) {
      applyApiError(error, setError, ["email", "currentPassword"]);
    }
  };

  const isBusy = isSubmitting || updateEmail.isPending;

  return (
    <form
      className="grid gap-4"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      {errors.root?.server?.message ? (
        <FormAlert>{errors.root.server.message}</FormAlert>
      ) : null}
      {message ? <FormSuccess>{message}</FormSuccess> : null}

      <Field
        label="Email"
        type="email"
        autoComplete="email"
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
        label="Current password"
        autoComplete="current-password"
        placeholder="Confirm with your password"
        error={errors.currentPassword?.message}
        {...register("currentPassword", {
          required: "Enter your current password.",
        })}
      />

      <Button type="submit" isLoading={isBusy}>
        Update email
      </Button>
    </form>
  );
};

export default EmailForm;
