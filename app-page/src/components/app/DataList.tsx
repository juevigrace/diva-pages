import { Checkbox } from 'diva-ui/components/checkbox';

export interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
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
  noPermissionMessage?: string;
  errorMessage?: string;
  hasPermission?: boolean;
  hasError?: boolean;
  actions?: (item: T) => React.ReactNode;
  actionHeader?: string;
  toolbar?: React.ReactNode;
  footer?: React.ReactNode;
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
  noPermissionMessage,
  errorMessage,
  hasPermission = true,
  hasError = false,
  actions,
  actionHeader = '',
  toolbar,
  footer,
}: DataListProps<T>) {
  const colCount = columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0);

  return (
    <div className="border-border bg-card rounded-xl border shadow-sm">
      {toolbar && (
        <div className="border-border border-b">
          {toolbar}
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
                  className={`text-muted-foreground px-6 py-3 text-left font-medium ${col.headerClassName || ''}`}
                >
                  {col.header}
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
            {!hasPermission ? (
              <tr>
                <td colSpan={colCount} className="text-muted-foreground px-6 py-12 text-center text-sm">
                  {noPermissionMessage || ''}
                </td>
              </tr>
            ) : hasError ? (
              <tr>
                <td colSpan={colCount} className="text-muted-foreground px-6 py-12 text-center text-sm">
                  {errorMessage || ''}
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={colCount} className="text-muted-foreground px-6 py-12 text-center text-sm">
                  {emptyMessage || ''}
                </td>
              </tr>
            ) : (
              data.map((item) => {
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
              })
            )}
          </tbody>
        </table>
      </div>
      {footer && (
        <div className="border-border border-t">
          {footer}
        </div>
      )}
    </div>
  );
}
