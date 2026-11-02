const Container = ({
  as: Component = "div",
  className = "",
  children,
  ...props
}) => (
  <Component
    className={`mx-auto w-[calc(100%-2.5rem)] max-w-[1180px] max-sm:w-[calc(100%-2rem)] ${className}`}
    {...props}
  >
    {children}
  </Component>
);

export default Container;
