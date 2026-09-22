import { useMemo, useState } from 'react'

export interface Column<T> {
  key: string
  label: string
  render: (row: T) => React.ReactNode
  sortValue: (row: T) => string | number
}

interface Props<T> {
  rows: T[]
  columns: Column<T>[]
  rowKey: (row: T) => string
  onRowClick?: (row: T) => void
}

export function DataTable<T>({ rows, columns, rowKey, onRowClick }: Props<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [dir, setDir] = useState<'asc' | 'desc'>('asc')

  const sorted = useMemo(() => {
    if (!sortKey) return rows
    const col = columns.find((c) => c.key === sortKey)
    if (!col) return rows
    const copy = [...rows]
    copy.sort((a, b) => {
      const av = col.sortValue(a)
      const bv = col.sortValue(b)
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return dir === 'asc' ? cmp : -cmp
    })
    return copy
  }, [rows, sortKey, dir, columns])

  function toggleSort(key: string) {
    if (sortKey === key) {
      setDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setDir('asc')
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="text-[11px] font-medium text-app-muted uppercase tracking-wider border-b border-app-border">
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                aria-sort={sortKey === c.key ? (dir === 'asc' ? 'ascending' : 'descending') : 'none'}
                className="pb-3 px-2"
              >
                <button
                  onClick={() => toggleSort(c.key)}
                  className="inline-flex items-center gap-1 hover:text-app-text"
                >
                  {c.label}
                  {sortKey === c.key && <span aria-hidden="true">{dir === 'asc' ? '▲' : '▼'}</span>}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-sm divide-y divide-app-border/50">
          {sorted.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={() => onRowClick?.(row)}
              className={onRowClick ? 'cursor-pointer hover:bg-app-hover/40' : ''}
            >
              {columns.map((c) => (
                <td key={c.key} className="py-3 px-2 text-xs">
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="py-10 text-center text-app-muted text-sm">
                No results
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
