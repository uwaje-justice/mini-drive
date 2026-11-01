const BrandMark = ({ className = "size-8" }) => (
  <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
    <path
      d="M6 26 7 5"
      fill="none"
      stroke="var(--color-primary)"
      strokeWidth="5"
      strokeLinecap="round"
    />
    <path
      d="M10.5 5 16 19.5 21.5 5"
      fill="none"
      stroke="var(--color-warning)"
      strokeWidth="4.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M26 26 25 5"
      fill="none"
      stroke="var(--color-secondary)"
      strokeWidth="5"
      strokeLinecap="round"
    />
  </svg>
);

export default BrandMark;
