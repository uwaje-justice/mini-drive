import { Link } from "react-router-dom";

import BrandMark from "@/components/brand-mark.jsx";

const BrandLink = ({ className = "" }) => (
  <Link
    to="/"
    className={`inline-flex shrink-0 items-center gap-[0.65rem] rounded-control text-[1.05rem] font-semibold tracking-[-0.02em] text-on-surface no-underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15 ${className}`}
  >
    <BrandMark className="size-8" />
    Mini Drive
  </Link>
);

export default BrandLink;
