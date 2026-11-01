const DriveLoading = ({ rows = 4 }) => (
  <div
    role="status"
    aria-live="polite"
    className="divide-y divide-outline-variant"
  >
    <span className="sr-only">Loading drive items</span>
    {Array.from({ length: rows }, (_, index) => (
      <div
        key={index}
        className="flex items-center gap-3 px-4 py-4 sm:px-5"
      >
        <span className="size-10 shrink-0 animate-pulse rounded-control bg-surface-container" />
        <span className="grid flex-1 gap-2">
          <span className="h-3 w-2/5 animate-pulse rounded-full bg-surface-container" />
          <span className="h-2.5 w-3/5 animate-pulse rounded-full bg-surface-container-low" />
        </span>
      </div>
    ))}
  </div>
);

export default DriveLoading;
