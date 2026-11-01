import { FiCheckCircle } from "react-icons/fi";

const FormSuccess = ({ children }) => (
  <div
    role="status"
    className="flex items-start gap-3 rounded-control border border-success/20 bg-success-container px-4 py-3 text-sm leading-6 text-on-success-container"
  >
    <FiCheckCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
    <span>{children}</span>
  </div>
);

export default FormSuccess;
