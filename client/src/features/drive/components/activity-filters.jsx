import { useEffect, useId, useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";

import Button from "@/components/ui/button.jsx";
import SelectField from "@/components/ui/select-field.jsx";

const actionOptions = [
  { value: "", label: "All actions" },
  { value: "uploaded", label: "Uploaded" },
  { value: "created", label: "Created" },
  { value: "renamed", label: "Renamed" },
  { value: "moved", label: "Moved" },
  { value: "deleted", label: "Deleted" },
  { value: "shared", label: "Shared" },
  { value: "unshared", label: "Share revoked" },
  { value: "email_changed", label: "Email changed" },
  { value: "password_changed", label: "Password changed" },
];

const targetTypeOptions = [
  { value: "", label: "All types" },
  { value: "file", label: "Files" },
  { value: "folder", label: "Folders" },
  { value: "account", label: "Account" },
];

const inputClass =
  "min-h-12 w-full rounded-control border border-outline-variant bg-surface pl-10 pr-3 text-sm text-on-surface shadow-sm outline-none transition placeholder:text-on-surface-variant/60 focus:border-primary focus:ring-4 focus:ring-primary/10";

const ActivityFilters = ({
  initialQuery,
  action,
  targetType,
  onApply,
  onClear,
}) => {
  const inputId = useId();
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const hasFilters = Boolean(
    initialQuery.trim() || action || targetType || query.trim(),
  );

  const apply = (next = {}) =>
    onApply({
      query: (next.query ?? query).trim(),
      action: next.action ?? action,
      targetType: next.targetType ?? targetType,
    });

  const submit = (event) => {
    event.preventDefault();
    apply();
  };

  const clear = () => {
    setQuery("");
    onClear();
  };

  return (
    <div className="border-b border-outline-variant px-4 py-4 sm:px-5">
      <form
        role="search"
        onSubmit={submit}
        className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_11rem_9rem_auto] sm:items-end"
      >
        <div className="grid gap-2">
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-on-surface"
          >
            Search activity
          </label>
          <div className="relative">
            <FiSearch
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant"
              aria-hidden="true"
            />
            <input
              id={inputId}
              type="search"
              value={query}
              maxLength={100}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search names and details"
              className={inputClass}
            />
          </div>
        </div>

        <SelectField
          label="Action"
          value={action}
          onChange={(event) => apply({ action: event.target.value })}
        >
          {actionOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>

        <SelectField
          label="Type"
          value={targetType}
          onChange={(event) => apply({ targetType: event.target.value })}
        >
          {targetTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>

        <div className="flex gap-2">
          <Button type="submit" size="sm">
            Search
          </Button>
          {hasFilters ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clear}
            >
              <FiX className="size-4" aria-hidden="true" />
              Clear
            </Button>
          ) : null}
        </div>
      </form>
    </div>
  );
};

export default ActivityFilters;
