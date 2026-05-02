import { cn } from '@/lib/utils';

interface Column<T> {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  emptyIcon?: React.ReactNode;
  emptyTitle?: string;
  emptyAction?: React.ReactNode;
}

export function DataTable<T>({ columns, data, keyField, emptyIcon, emptyTitle, emptyAction }: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            {columns.map((col) => (
              <th key={col.key} className={cn('px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground', col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                  {emptyIcon && <div className="text-muted-foreground/30">{emptyIcon}</div>}
                  <p className="text-sm font-medium text-muted-foreground">{emptyTitle ?? 'No data found'}</p>
                  {emptyAction}
                </div>
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={String(row[keyField])} className="transition-colors hover:bg-muted/30">
                {columns.map((col) => (
                  <td key={col.key} className={cn('px-4 py-3', col.className)}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
