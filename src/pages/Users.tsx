import { useMemo, useState } from 'react'
import { USERS, countryOf, regionOf, type AppUser } from '../lib/mockData'
import { DataTable, type Column } from '../components/DataTable'
import { useSavedViews } from '../lib/useSavedViews'
import { useSession } from '../state/sessionStore'
import { useApprovals } from '../state/approvalsStore'

interface Filters {
  status: string
  risk: string
}

const DEFAULT_FILTERS: Filters = { status: 'All', risk: 'All' }

const columns: Column<AppUser>[] = [
  { key: 'id', label: 'User ID', render: (u) => u.id, sortValue: (u) => u.id },
  { key: 'name', label: 'Name', render: (u) => u.name, sortValue: (u) => u.name },
  { key: 'country', label: 'Country', render: (u) => countryOf(u.country), sortValue: (u) => countryOf(u.country) },
  { key: 'region', label: 'Region', render: (u) => regionOf(u.country), sortValue: (u) => regionOf(u.country) },
  { key: 'status', label: 'Status', render: (u) => u.status, sortValue: (u) => u.status },
  { key: 'risk', label: 'Risk', render: (u) => u.risk, sortValue: (u) => u.risk },
]

function buildColumns(onSuspend: (u: AppUser) => void): Column<AppUser>[] {
  return [
    ...columns,
    {
      key: 'actions',
      label: '',
      sortValue: () => '',
      render: (u) => (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onSuspend(u)
          }}
          disabled={u.status === 'Suspended'}
          className="px-2 py-1 bg-app-main border border-red-500/40 text-red-500 rounded-lg text-[11px] font-medium hover:bg-red-500/10 disabled:opacity-40"
        >
          Suspend
        </button>
      ),
    },
  ]
}

export function Users() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const { views, save, remove } = useSavedViews<Filters>('users')
  const { me } = useSession()
  const { request } = useApprovals()

  function requestSuspend(u: AppUser) {
    if (!me) return
    request({
      action: 'users.suspend',
      target: u.id,
      reason: `Suspend ${u.name} pending review`,
      requestedBy: { name: me.name, email: me.email, role: me.role },
      requiredPermission: 'users.suspend',
      onApprove: () => {
        u.status = 'Suspended'
      },
    })
    window.alert(`Suspend request for ${u.id} sent for approval.`)
  }

  const rows = useMemo(
    () =>
      USERS.filter(
        (u) =>
          (filters.status === 'All' || u.status === filters.status) &&
          (filters.risk === 'All' || u.risk === filters.risk),
      ),
    [filters],
  )

  function saveCurrentView() {
    const name = window.prompt('Name this view')
    if (name) save(name, filters)
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-app-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">All Users</h1>
          <p className="text-sm text-app-muted">Search, filter and open a profile</p>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="status-filter" className="sr-only">Status filter</label>
        <select
          id="status-filter"
          aria-label="Status filter"
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          className="bg-app-main border border-app-border rounded-lg px-2 py-1.5 text-xs outline-none"
        >
          {['All', 'Active', 'Pending', 'Restricted', 'Suspended', 'Deactivated'].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <label htmlFor="risk-filter" className="sr-only">Risk filter</label>
        <select
          id="risk-filter"
          aria-label="Risk filter"
          value={filters.risk}
          onChange={(e) => setFilters((f) => ({ ...f, risk: e.target.value }))}
          className="bg-app-main border border-app-border rounded-lg px-2 py-1.5 text-xs outline-none"
        >
          {['All', 'Low', 'Medium', 'High'].map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>

        <button
          onClick={saveCurrentView}
          className="px-3 py-1.5 bg-app-main border border-app-border rounded-lg text-xs font-medium hover:bg-app-hover"
        >
          Save view
        </button>

        {views.map((v) => (
          <span
            key={v.name}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs border border-app-border"
          >
            <button onClick={() => setFilters(v.filters)} className="hover:text-app-accent">
              {v.name}
            </button>
            <button onClick={() => remove(v.name)} aria-label={`Delete view ${v.name}`} className="text-app-muted hover:text-red-500">
              ×
            </button>
          </span>
        ))}
      </div>

      <div className="bg-app-card border border-app-border rounded-2xl p-5">
        <DataTable rows={rows} columns={buildColumns(requestSuspend)} rowKey={(u) => u.id} />
      </div>
    </div>
  )
}
