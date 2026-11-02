import { useEffect } from "react";
import { useForm } from "react-hook-form";

import Button from "@/components/ui/button.jsx";
import FormAlert from "@/components/ui/form-alert.jsx";
import Modal from "@/components/ui/modal.jsx";
import SelectField from "@/components/ui/select-field.jsx";
import applyApiError from "@/features/auth/apply-api-error.js";

const MoveDialog = ({
  open,
  title,
  description,
  currentValue,
  targets,
  targetsPending,
  targetsError,
  fieldName,
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
    defaultValues: { destination: currentValue ?? "" },
  });

  useEffect(() => {
    if (open) reset({ destination: currentValue ?? "" });
  }, [currentValue, open, reset]);

  const submit = async ({ destination }) => {
    clearErrors();

    try {
      await onSubmit(destination || null);
      onClose();
    } catch (error) {
      applyApiError(error, setError, [fieldName]);
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
        {targetsError ? (
          <FormAlert>{targetsError.message}</FormAlert>
        ) : null}

        <SelectField
          label="Move to"
          error={errors.destination?.message}
          disabled={targetsPending || targetsError}
          {...register("destination")}
        >
          {targets?.map((target) => (
            <option key={target.id ?? "root"} value={target.id ?? ""}>
              {target.path}
            </option>
          ))}
        </SelectField>

        {targetsPending ? (
          <p className="text-xs text-on-surface-variant">
            Loading folders...
          </p>
        ) : null}

        <div className="flex flex-wrap justify-end gap-2">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isBusy}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isBusy}
            disabled={targetsPending || Boolean(targetsError)}
          >
            Move
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default MoveDialog;
