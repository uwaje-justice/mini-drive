import { useEffect } from "react";
import { useForm } from "react-hook-form";

import Button from "@/components/ui/button.jsx";
import Field from "@/components/ui/field.jsx";
import FormAlert from "@/components/ui/form-alert.jsx";
import Modal from "@/components/ui/modal.jsx";
import applyApiError from "@/features/auth/apply-api-error.js";

const NameDialog = ({
  open,
  title,
  description,
  label,
  initialValue = "",
  submitLabel,
  hint,
  maxLength,
  isPending = false,
  onSubmit,
  onClose,
}) => {
  const {
    clearErrors,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm({
    defaultValues: { name: initialValue },
  });

  useEffect(() => {
    if (open) reset({ name: initialValue });
  }, [initialValue, open, reset]);

  const submit = async ({ name }) => {
    clearErrors();

    try {
      await onSubmit(name);
      onClose();
    } catch (error) {
      applyApiError(error, setError, ["name"]);
    }
  };

  const isBusy = isSubmitting || isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
    >
      <form
        className="grid gap-4"
        onSubmit={handleSubmit(submit)}
        noValidate
      >
        {errors.root?.server?.message ? (
          <FormAlert>{errors.root.server.message}</FormAlert>
        ) : null}

        <Field
          label={label}
          autoComplete="off"
          maxLength={maxLength}
          hint={hint}
          error={errors.name?.message}
          {...register("name", {
            required: `${label} is required.`,
            maxLength: {
              value: maxLength,
              message: `${label} must be ${maxLength} characters or fewer.`,
            },
          })}
        />

        <div className="flex flex-wrap justify-end gap-2">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isBusy}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={isBusy}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default NameDialog;
