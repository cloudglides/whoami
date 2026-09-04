"use client";

import { useCallback } from "react";
import { XIcon, SearchIcon, FilterIcon } from "lucide-react";

type FilterOption = { value: string; label: string };

type FilterConfig = {
  key: string;
  label: string;
  type: "search" | "select" | "date-range";
  options?: FilterOption[];
  placeholder?: string;
};

interface FilterBarProps {
  filters: FilterConfig[];
  values: Record<string, string>;
  onChange: (values: Record<string, string>) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
  className?: string;
}

export default function FilterBar({
  filters,
  values,
  onChange,
  onClear,
  hasActiveFilters,
  className = "",
}: FilterBarProps) {
  const handleChange = useCallback(
    (key: string, value: string) => {
      onChange({ ...values, [key]: value });
    },
    [values, onChange]
  );

  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex flex-col sm:flex-row gap-4">
        {filters.map((filter) => (
          <div key={filter.key} className="flex-1 min-w-0 sm:max-w-[280px]">
            {filter.type === "search" && (
              <>
                <label htmlFor={`filter-${filter.key}`} className="sr-only">
                  {filter.label}
                </label>
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-govuk-grey-4" aria-hidden="true" />
                  <input
                    id={`filter-${filter.key}`}
                    type="search"
                    value={values[filter.key] ?? ""}
                    onChange={(e) => handleChange(filter.key, e.target.value)}
                    placeholder={filter.placeholder ?? `Search ${filter.label.toLowerCase()}`}
                    className="w-full border-2 border-govuk-black px-10 py-2 text-base bg-white"
                  />
                  {values[filter.key] && (
                    <button
                      type="button"
                      onClick={() => handleChange(filter.key, "")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-govuk-grey-4 hover:text-govuk-black"
                      aria-label={`Clear ${filter.label}`}
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </>
            )}

            {filter.type === "select" && (
              <div className="relative">
                <label htmlFor={`filter-${filter.key}`} className="sr-only">
                  {filter.label}
                </label>
                <select
                  id={`filter-${filter.key}`}
                  value={values[filter.key] ?? ""}
                  onChange={(e) => handleChange(filter.key, e.target.value)}
                  className="w-full max-w-xs border-2 border-govuk-black px-3 py-2 text-base bg-white appearance-none pr-10"
                >
                  <option value="">{filter.placeholder ?? `All ${filter.label}`}</option>
                  {filter.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <FilterIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-govuk-grey-4 pointer-events-none" aria-hidden="true" />
              </div>
            )}
          </div>
        ))}

        <div className="flex flex-wrap items-end gap-2 sm:ml-auto">
          <button
            type="button"
            onClick={onClear}
            disabled={!hasActiveFilters}
            className="govuk-button govuk-button--secondary govuk-button--small"
          >
            Clear filters
          </button>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-3 flex flex-wrap items-center gap-2" role="status" aria-live="polite">
          <span className="text-sm text-govuk-grey-4">Active filters:</span>
          {Object.entries(values)
            .filter(([, v]) => v)
            .map(([key, value]) => {
              const filter = filters.find((f) => f.key === key);
              const label = filter?.type === "select"
                ? filter.options?.find((o) => o.value === value)?.label ?? value
                : value;
              return (
                <span key={key} className="govuk-tag govuk-tag--grey text-xs flex items-center gap-1">
                  {filter?.label}: {label}
                  <button
                    type="button"
                    onClick={() => handleChange(key, "")}
                    className="ml-1 hover:text-govuk-black"
                    aria-label={`Remove ${filter?.label} filter`}
                  >
                    <XIcon className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
        </div>
      )}
    </div>
  );
}