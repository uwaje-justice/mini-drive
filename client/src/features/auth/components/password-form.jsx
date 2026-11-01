import { useState } from "react";
import { useForm } from "react-hook-form";

import Button from "@/components/ui/button.jsx";
import FormAlert from "@/components/ui/form-alert.jsx";
import FormSuccess from "@/components/ui/form-success.jsx";
import applyApiError from "@/features/auth/apply-api-error.js";
import PasswordField from "@/features/auth/components/password-field.jsx";
import useUpdatePassword from "@/features/auth/hooks/use-update-password.js";

const PasswordForm = () => {
  const updatePassword = useUpdatePassword();
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
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values) => {
    clearErrors();
    setMessage("");

    try {
      await updatePassword.mutateAsync(values);
      reset();
      setMessage("Password changed. Other sessions were signed out.");
    } catch (error) {
      applyApiError(error, setError, [
        "currentPassword",
        "newPassword",
        "confirmPassword",
      ]);
    }
  };

  const isBusy = isSubmitting || updatePassword.isPending;

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

      <PasswordField
        label="Current password"
        autoComplete="current-password"
        placeholder="Confirm with your password"
        error={errors.currentPassword?.message}
        {...register("currentPassword", {
          required: "Enter your current password.",
        })}
      />

      <PasswordField
        label="New password"
        autoComplete="new-password"
        placeholder="At least 8 characters"
        hint="Use 8 to 128 characters."
        error={errors.newPassword?.message}
        {...register("newPassword", {
          required: "Create a new password.",
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
        label="Confirm new password"
        autoComplete="new-password"
        placeholder="Repeat the new password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword", {
          required: "Repeat the new password.",
          validate: (value, values) =>
            value === values.newPassword || "Passwords do not match.",
        })}
      />

      <Button type="submit" isLoading={isBusy}>
        Change password
      </Button>
    </form>
  );
};

export default PasswordForm;
