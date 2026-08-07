import { useMemo, useState } from 'react';
import { Checkbox } from 'diva-ui/components/checkbox';
import { Button } from 'diva-ui/components/button';
import { Skeleton } from 'diva-ui/components/skeleton';

export interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  sortValue?: (item: T) => string | number | null | undefined;
  csvValue?: (item: T) => string | number | null | undefined;
}

export interface DataListProps<T> {
  columns: Column<T>[];
  data: T[];
  getId: (item: T) => string;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  onToggleSelectAll?: () => void;
  allSelected?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
  noPermissionMessage?: string;
  errorMessage?: string;
  hasPermission?: boolean;
  hasError?: boolean;
  actions?: (item: T) => React.ReactNode;
  actionHeader?: string;
  toolbar?: React.ReactNode;
  footer?: React.ReactNode;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchText?: (item: T) => string;
  sortable?: boolean;
  defaultSortKey?: string;
  paginated?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  exportable?: boolean;
  exportFilename?: string;
  exportLabel?: string;
  loading?: boolean;
  emptyAction?: React.ReactNode;
}

type SortDir = 'asc' | 'desc';

function sortValueFor<T>(item: T, col: Column<T>): string | number | null {
  const raw = col.sortValue ? col.sortValue(item) : (item as Record<string, unknown>)[col.key];
  if (typeof raw === 'string') return raw.toLowerCase();
  if (typeof raw === 'number') return raw;
  return null;
}

function downloadCsv<T>(columns: Column<T>[], rows: T[], filename: string) {
  const escape = (value: unknown): string => {
    const text = value === null || value === undefined ? '' : String(value);
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const header = columns.map((col) => escape(col.header)).join(',');
  const lines = rows.map((row) =>
    columns
      .map((col) => {
        const raw = col.csvValue
          ? col.csvValue(row)
          : col.sortValue
            ? col.sortValue(row)
            : (row as Record<string, unknown>)[col.key];
        return escape(raw);
      })
      .join(','),
  );
  const blob = new Blob([`\uFEFF${[header, ...lines].join('\n')}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename || 'export'}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function DataList<T>({
  columns,
  data,
  getId,
  selectable = false,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  allSelected = false,
  emptyMessage,
  emptyDescription,
  noPermissionMessage,
  errorMessage,
  hasPermission = true,
  hasError = false,
  actions,
  actionHeader = '',
  toolbar,
  footer,
  searchable = false,
  searchPlaceholder = 'Search...',
  searchText,
  sortable = false,
  defaultSortKey,
  paginated = false,
  pageSize = 10,
  pageSizeOptions = [10, 25, 50],
  exportable = false,
  exportFilename,
  exportLabel = 'Export CSV',
  loading = false,
  emptyAction,
}: DataListProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(defaultSortKey ?? null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);

  const colCount = columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0);

  const filtered = useMemo(() => {
    if (!searchable || !searchQuery) return data;
    const q = searchQuery.toLowerCase();
    return data.filter((item) => {
      const text = searchText
        ? searchText(item)
        : columns
            .map((col) => {
              const v = (item as Record<string, unknown>)[col.key];
              return v === null || v === undefined ? '' : String(v);
            })
            .join(' ');
      return text.toLowerCase().includes(q);
    });
  }, [data, searchable, searchQuery, searchText, columns]);

  const sorted = useMemo(() => {
    if (!sortable || !sortKey) return filtered;
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return filtered;
    const next = [...filtered].sort((a, b) => {
      const va = sortValueFor(a, col);
      const vb = sortValueFor(b, col);
      if (va === null && vb === null) return 0;
      if (va === null) return 1;
      if (vb === null) return -1;
      if (typeof va === 'number' && typeof vb === 'number') return va - vb;
      const cmp = String(va).localeCompare(String(vb));
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return next;
  }, [filtered, sortable, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / rowsPerPage));
  const safePage = Math.min(page, totalPages);
  const pageRows = paginated ? sorted.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage) : sorted;

  const handleSort = (col: Column<T>) => {
    if (!sortable) return;
    if (sortKey === col.key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(col.key);
      setSortDir('asc');
    }
  };

  const handleExport = () => {
    downloadCsv(columns, sorted, exportFilename || 'export');
  };

  const renderBody = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan={colCount} className="px-6 py-4">
            <div className="space-y-3">
              {Array.from({ length: Math.min(rowsPerPage, 5) }).map((_, i) => (
                <div key={i} className="flex items-center gap-6">
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </td>
        </tr>
      );
    }
    if (!hasPermission) {
      return (
        <tr>
          <td colSpan={colCount} className="text-muted-foreground px-6 py-12 text-center text-sm">
            {noPermissionMessage || ''}
          </td>
        </tr>
      );
    }
    if (hasError) {
      return (
        <tr>
          <td colSpan={colCount} className="text-muted-foreground px-6 py-12 text-center text-sm">
            {errorMessage || ''}
          </td>
        </tr>
      );
    }
    if (pageRows.length === 0) {
      return (
        <tr>
          <td colSpan={colCount} className="px-6 py-16 text-center">
            <div className="text-muted-foreground mx-auto flex max-w-xs flex-col items-center gap-2">
              <svg
                className="text-muted-foreground/50 h-10 w-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 7.5h12M6 12h12M6 16.5h8M4.5 3h15A1.5 1.5 0 0121 4.5v15a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 19.5v-15A1.5 1.5 0 014.5 3z"
                />
              </svg>
              <p className="text-sm font-medium">{emptyMessage || ''}</p>
              {emptyDescription && <p className="text-muted-foreground text-xs">{emptyDescription}</p>}
              {emptyAction}
            </div>
          </td>
        </tr>
      );
    }
    return pageRows.map((item) => {
      const id = getId(item);
      return (
        <tr key={id} className="border-border hover:bg-muted/50 border-b">
          {selectable && (
            <td className="px-6 py-4">
              <Checkbox
                checked={selectedIds?.has(id) || false}
                onCheckedChange={() => onToggleSelect?.(id)}
              />
            </td>
          )}
          {columns.map((col) => (
            <td key={col.key} className={`px-6 py-4 ${col.className || ''}`}>
              {col.render(item)}
            </td>
          ))}
          {actions && (
            <td className="px-6 py-4 text-right">
              {actions(item)}
            </td>
          )}
        </tr>
      );
    });
  };

  return (
    <div className="border-border bg-card rounded-xl border shadow-sm">
      {toolbar && (
        <div className="border-border border-b">
          {toolbar}
        </div>
      )}
      {(searchable || exportable) && (
        <div className="border-border flex flex-wrap items-center justify-between gap-3 border-b px-6 py-3">
          {searchable ? (
            <div className="relative">
              <svg
                className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                className="border-input placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-60 rounded-md border bg-transparent pr-3 pl-10 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          ) : (
            <div />
          )}
          {exportable && (
            <Button type="button" variant="outline" size="sm" onClick={handleExport} disabled={sorted.length === 0}>
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              {exportLabel}
            </Button>
          )}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full min-w-max text-sm">
          <thead>
            <tr className="border-border bg-muted/50 border-b">
              {selectable && (
                <th className="px-6 py-3 text-left">
                  {data.length > 0 && (
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={() => onToggleSelectAll?.()}
                    />
                  )}
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col)}
                  className={`text-muted-foreground px-6 py-3 text-left font-medium ${col.headerClassName || ''} ${
                    sortable ? 'cursor-pointer select-none hover:text-foreground' : ''
                  }`}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {sortable && sortKey === col.key && (
                      <svg
                        className={`h-3.5 w-3.5 ${sortDir === 'asc' ? '' : 'rotate-180'}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                      </svg>
                    )}
                  </span>
                </th>
              ))}
              {actions && (
                <th className="text-muted-foreground px-6 py-3 text-right font-medium">
                  {actionHeader}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {renderBody()}
          </tbody>
        </table>
      </div>
      {paginated && totalPages > 1 && (
        <div className="border-border flex flex-wrap items-center justify-between gap-3 border-t px-6 py-4">
          <p className="text-muted-foreground text-sm">
            {(safePage - 1) * rowsPerPage + 1}–{Math.min(safePage * rowsPerPage, sorted.length)} of {sorted.length}
          </p>
          <div className="flex items-center gap-2">
            <select
              className="border-input bg-background rounded-md border px-2 py-1 text-xs"
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setPage(1);
              }}
            >
              {pageSizeOptions.map((n) => (
                <option key={n} value={n}>
                  {n} / page
                </option>
              ))}
            </select>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={safePage <= 1}
              onClick={() => setPage(safePage - 1)}
            >
              &larr;
            </Button>
            <span className="text-muted-foreground px-1 text-xs">
              {safePage} / {totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={safePage >= totalPages}
              onClick={() => setPage(safePage + 1)}
            >
              &rarr;
            </Button>
          </div>
        </div>
      )}
      {!paginated && footer && (
        <div className="border-border border-t">
          {footer}
        </div>
      )}
    </div>
  );
}
