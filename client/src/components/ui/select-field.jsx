import { useId } from "react";
import { FiAlertCircle } from "react-icons/fi";

const selectStyles =
  "min-h-12 w-full rounded-control border border-outline-variant bg-surface px-4 text-sm text-on-surface shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:bg-surface-container-low";

const SelectField = ({
  label,
  error,
  hint,
  id,
  className = "",
  children,
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
      <select
        id={fieldId}
        className={`${selectStyles} ${
          error ? "border-error focus:border-error focus:ring-error/10" : ""
        }`}
        aria-invalid={Boolean(error)}
        aria-describedby={hasHelp ? helpId : undefined}
        {...props}
      >
        {children}
      </select>
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

export default SelectField;
