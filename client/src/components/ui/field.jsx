import { useId } from "react";
import { FiAlertCircle } from "react-icons/fi";

const inputStyles =
  "min-h-12 w-full rounded-control border border-outline-variant bg-surface px-4 text-sm text-on-surface shadow-sm outline-none transition placeholder:text-on-surface-variant/60 focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:bg-surface-container-low";

const Field = ({
  label,
  error,
  hint,
  id,
  endAdornment,
  className = "",
  ...props
}) => {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const helpId = `${fieldId}-help`;
  const hasHelp = Boolean(error || hint);

  return (
    <div className={`grid gap-2 ${className}`}>
      <label
        htmlFor={fieldId}
        className="text-sm font-medium text-on-surface"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={fieldId}
          className={`${inputStyles} ${
            error
              ? "border-error focus:border-error focus:ring-error/10"
              : ""
          } ${endAdornment ? "pr-12" : ""}`}
          aria-invalid={Boolean(error)}
          aria-describedby={hasHelp ? helpId : undefined}
          {...props}
        />
        {endAdornment ? (
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            {endAdornment}
          </div>
        ) : null}
      </div>
      {error ? (
        <p
          id={helpId}
          className="flex items-center gap-1.5 text-xs font-medium text-error"
        >
          <FiAlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}
      {!error && hint ? (
        <p id={helpId} className="text-xs text-on-surface-variant">
          {hint}
        </p>
      ) : null}
    </div>
  );
};

export default Field;
