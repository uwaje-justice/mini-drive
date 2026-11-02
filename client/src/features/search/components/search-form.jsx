import { useEffect, useId, useState } from "react";
import { FiArrowRight, FiSearch } from "react-icons/fi";

import Button from "@/components/ui/button.jsx";

const SearchForm = ({
  initialValue = "",
  onSearch,
  onClear,
  autoFocus = false,
  compact = false,
}) => {
  const inputId = useId();
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const change = (event) => {
    const next = event.target.value;

    setValue(next);
    if (!next.trim() && value.trim()) onClear?.();
  };

  const submit = (event) => {
    event.preventDefault();
    onSearch(value.trim());
  };

  return (
    <form role="search" onSubmit={submit} className="flex items-center gap-2">
      <label htmlFor={inputId} className="sr-only">
        Search your drive
      </label>
      <div className="relative min-w-0 flex-1">
        <FiSearch
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant"
          aria-hidden="true"
        />
        <input
          id={inputId}
          type="search"
          value={value}
          autoFocus={autoFocus}
          maxLength={100}
          onChange={change}
          placeholder="Search your drive"
          className="min-h-10 w-full rounded-control border border-outline-variant bg-surface pl-9 pr-3 text-sm text-on-surface shadow-sm outline-none transition placeholder:text-on-surface-variant/60 focus:border-primary focus:ring-4 focus:ring-primary/10"
        />
      </div>
      <Button
        type="submit"
        size="sm"
        className={compact ? "px-3" : undefined}
        aria-label={compact ? "Search" : undefined}
      >
        {compact ? (
          <FiArrowRight className="size-4" aria-hidden="true" />
        ) : (
          "Search"
        )}
      </Button>
    </form>
  );
};

export default SearchForm;
