import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

import Field from "@/components/ui/field.jsx";

const PasswordField = ({ label = "Password", ...props }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <Field
      {...props}
      label={label}
      type={isVisible ? "text" : "password"}
      endAdornment={
        <button
          type="button"
          className="grid size-9 cursor-pointer place-items-center rounded-full text-on-surface-variant transition hover:bg-surface-container-low hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          onClick={() => setIsVisible((current) => !current)}
          aria-label={isVisible ? "Hide password" : "Show password"}
        >
          {isVisible ? (
            <FiEyeOff className="size-4" aria-hidden="true" />
          ) : (
            <FiEye className="size-4" aria-hidden="true" />
          )}
        </button>
      }
    />
  );
};

export default PasswordField;
