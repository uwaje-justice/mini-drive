import { FiAlertCircle } from "react-icons/fi";

const FormAlert = ({ children }) => (
  <div
    role="alert"
    className="flex items-start gap-3 rounded-control border border-error/20 bg-error-container px-4 py-3 text-sm leading-6 text-on-error-container"
  >
    <FiAlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
    <span>{children}</span>
  </div>
);

export default FormAlert;
