import { FiLoader } from "react-icons/fi";

const Spinner = ({ className = "size-5" }) => (
  <FiLoader className={`animate-spin ${className}`} aria-hidden="true" />
);

export default Spinner;
