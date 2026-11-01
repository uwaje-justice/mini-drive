import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

import Button from "@/components/ui/button.jsx";

const PaginationControls = ({ pagination, label, onChange }) => {
  if (!pagination || pagination.totalPages <= 1) return null;

  return (
    <nav
      aria-label={label}
      className="flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant px-4 py-3 sm:px-5"
    >
      <p className="text-xs text-on-surface-variant">
        Page {pagination.page} of {pagination.totalPages}
      </p>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={!pagination.hasPrevious}
          onClick={() => onChange(pagination.page - 1)}
        >
          <FiChevronLeft className="size-4" aria-hidden="true" />
          Previous
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={!pagination.hasNext}
          onClick={() => onChange(pagination.page + 1)}
        >
          Next
          <FiChevronRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </nav>
  );
};

export default PaginationControls;
