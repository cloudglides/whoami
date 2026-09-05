"use client";

import { useState, useMemo } from "react";
import { ChevronUpIcon, ChevronDownIcon } from "lucide-react";

// aria-sort is valid on button elements for sortable column headers
/* eslint-disable jsx-a11y/role-supports-aria-props */

type SortDirection = "asc" | "desc" | null;

type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
};

type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  rowKey?: string;
  className?: string;
  initialSortKey?: string;
  initialSortDirection?: SortDirection;
  onRowClick?: (row: T) => void;
  showPagination?: boolean;
  pageSize?: number;
};

function SortableHeader<T>({
  column,
  sortKey,
  sortDirection,
  onSort,
}: {
  column: Column<T>;
  sortKey: string | null;
  sortDirection: SortDirection;
  onSort: (key: string) => void;
}) {
  if (!column.sortable) {
    return <th className={`py-2 pr-4 font-bold ${column.className ?? ""}`}>{column.header}</th>;
  }

  const isActive = sortKey === column.key;
  const icon = isActive
    ? sortDirection === "asc"
      ? <ChevronUpIcon className="w-4 h-4 inline-block ml-1" aria-hidden="true" />
      : <ChevronDownIcon className="w-4 h-4 inline-block ml-1" aria-hidden="true" />
    : null;

  return (
    <th className={`py-2 pr-4 font-bold ${column.className ?? ""} cursor-pointer select-none hover:bg-govuk-grey-1`}>
      <button
        type="button"
        onClick={() => onSort(column.key)}
        className="flex items-center gap-1 w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-govuk-focus"
        aria-sort={isActive ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
      >
        {column.header}
        {icon}
      </button>
    </th>
  );
}

export default function DataTable<T>({
  columns,
  data,
  emptyMessage = "No data.",
  rowKey = "id",
  className = "",
  initialSortKey,
  initialSortDirection = "desc",
  onRowClick,
  showPagination = false,
  pageSize = 25,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(initialSortKey ?? null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(initialSortDirection);
  const [currentPage, setCurrentPage] = useState(1);

  const handleSort = (key: string) => {
    const column = columns.find((c) => c.key === key);
    if (!column?.sortable) return;

    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : prev === "desc" ? null : "asc"));
      if (sortDirection === "desc") setSortKey(null);
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    const column = columns.find((c) => c.key === sortKey);
    if (!column?.sortable) return data;

    return [...data].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortKey];
      const bVal = (b as Record<string, unknown>)[sortKey];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      const comparison = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [data, sortKey, sortDirection, columns]);

  const paginatedData = useMemo(() => {
    if (!showPagination) return sortedData;
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, showPagination, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  if (data.length === 0) {
    return (
      <div className="py-8 text-center text-govuk-grey-4">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse text-left" role="grid">
          <thead>
            <tr className="border-b-2 border-govuk-black">
              {columns.map((col) => (
                <SortableHeader
                  key={col.key}
                  column={col}
                  sortKey={sortKey}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row) => (
              <tr
                key={(row as Record<string, unknown>)[rowKey] as string}
                className={`border-b border-govuk-grey-2 align-top ${onRowClick ? "cursor-pointer hover:bg-govuk-grey-1" : ""}`}
                onClick={() => onRowClick?.(row)}
                tabIndex={onRowClick ? 0 : undefined}
                onKeyDown={(e) => {
                  if (onRowClick && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    onRowClick(row);
                  }
                }}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`py-2 pr-4 ${col.className ?? ""} ${col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : ""}`}
                    style={col.width ? { width: col.width } : undefined}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card layout */}
      <div className="md:hidden space-y-4">
        {paginatedData.map((row) => (
          <div
            key={(row as Record<string, unknown>)[rowKey] as string}
            className={`border-2 border-govuk-black bg-govuk-grey-1 p-4 ${onRowClick ? "cursor-pointer hover:bg-govuk-grey-2" : ""}`}
            onClick={() => onRowClick?.(row)}
            tabIndex={onRowClick ? 0 : undefined}
            onKeyDown={(e) => {
              if (onRowClick && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                onRowClick(row);
              }
            }}
          >
            {columns.map((col) => (
              <div key={col.key} className="flex justify-between gap-4 py-1 border-b border-govuk-grey-2 last:border-0">
                <dt className="text-sm font-medium text-govuk-grey-4 w-1/3 truncate min-w-0">
                  {col.header}
                </dt>
                <dd className="text-sm font-medium text-govuk-black w-2/3 text-right break-words min-w-0">
                  {col.render(row)}
                </dd>
              </div>
            ))}
          </div>
        ))}
      </div>

      {showPagination && totalPages > 1 && (
        <nav className="mt-4 flex items-center justify-between gap-4" aria-label="Pagination">
          <p className="text-sm text-govuk-grey-4">
            Showing page {currentPage} of {totalPages} ({sortedData.length} results)
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="govuk-button govuk-button--secondary govuk-button--small"
              aria-label="Previous page"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="govuk-button govuk-button--secondary govuk-button--small"
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}

/* eslint-enable jsx-a11y/role-supports-aria-props */