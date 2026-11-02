import { useId } from "react";

const DrivePanel = ({
  kicker,
  title,
  description,
  action,
  isFetching = false,
  children,
}) => {
  const titleId = useId();

  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-outline-variant bg-surface shadow-1">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-outline-variant px-4 py-4 sm:px-5">
        <div className="min-w-0">
          {kicker ? (
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-secondary">
              {kicker}
            </p>
          ) : null}
          <h2
            id={titleId}
            className="mt-1 text-xl font-semibold tracking-tight text-on-surface [overflow-wrap:anywhere]"
          >
            {title}
          </h2>
          {description ? (
            <p className="mt-1 text-sm text-on-surface-variant">
              {description}
            </p>
          ) : null}
        </div>
        {action}
      </header>

      <div
        role="region"
        aria-labelledby={titleId}
        className={`transition-opacity ${
          isFetching ? "opacity-60" : "opacity-100"
        }`}
      >
        {children}
      </div>
    </section>
  );
};

export default DrivePanel;
