import { Link } from "react-router-dom";

const variants = {
  primary:
    "border-transparent bg-primary text-on-primary shadow-[0_1px_2px_rgba(13,71,181,0.16)] hover:bg-primary-hover hover:shadow-2",
  secondary:
    "border-outline-variant bg-surface/80 text-primary hover:border-outline hover:bg-surface-container-low",
  quiet: "border-transparent text-primary hover:bg-surface-container-low",
  danger:
    "border-transparent bg-error-container text-on-error-container hover:bg-error/10 hover:shadow-2",
};

const sizes = {
  sm: "min-h-10 px-4 py-2.5",
  md: "min-h-11 px-5 py-3",
  lg: "min-h-12 px-5 py-3",
};

const LinkButton = ({
  to,
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}) => (
  <Link
    to={to}
    className={`inline-flex items-center justify-center gap-2 rounded-control border text-center text-sm font-semibold leading-tight transition hover:-translate-y-px active:translate-y-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15 motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${variants[variant]} ${sizes[size]} ${className}`}
    {...props}
  >
    {children}
  </Link>
);

export default LinkButton;
