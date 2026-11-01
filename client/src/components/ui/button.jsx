import Spinner from "@/components/ui/spinner.jsx";

const variants = {
  primary:
    "border-transparent bg-primary text-on-primary shadow-sm hover:bg-primary-hover",
  secondary:
    "border-outline-variant bg-surface text-primary hover:border-primary/30 hover:bg-surface-container-low",
  ghost:
    "border-transparent text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface",
  danger:
    "border-transparent bg-error-container text-on-error-container hover:bg-error/10",
};

const sizes = {
  sm: "min-h-9 px-3 text-xs",
  md: "min-h-11 px-4 text-sm",
  lg: "min-h-12 px-5 text-base",
};

const Button = ({
  variant = "primary",
  size = "md",
  isLoading = false,
  className = "",
  children,
  disabled,
  ...props
}) => (
  <button
    type="button"
    className={`inline-flex items-center justify-center gap-2 rounded-control border font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`}
    disabled={disabled || isLoading}
    aria-busy={isLoading}
    {...props}
  >
    {isLoading ? <Spinner className="size-4" /> : null}
    {children}
  </button>
);

export default Button;
