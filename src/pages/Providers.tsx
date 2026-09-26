import { DataTable, type Column } from '../components/DataTable'
import { RestrictedNotice } from '../components/Layout'
import { type Provider } from '../lib/mockData'
import { has } from '../lib/permissions'
import { useOperations } from '../state/operationsStore'
import { useSession } from '../state/sessionStore'

const baseColumns: Column<Provider>[] = [
  { key: 'name', label: 'Provider', render: (provider) => provider.name, sortValue: (provider) => provider.name },
  { key: 'status', label: 'Status', render: (provider) => provider.status, sortValue: (provider) => provider.status },
  { key: 'syncSuccess', label: 'Sync success', render: (provider) => provider.syncSuccess, sortValue: (provider) => Number.parseFloat(provider.syncSuccess) },
  { key: 'avgSync', label: 'Average sync', render: (provider) => provider.avgSync, sortValue: (provider) => Number.parseFloat(provider.avgSync) },
  { key: 'apiErrors', label: 'API errors', render: (provider) => provider.apiErrors, sortValue: (provider) => provider.apiErrors },
  { key: 'webhookErrors', label: 'Webhook errors', render: (provider) => provider.webhookErrors, sortValue: (provider) => provider.webhookErrors },
  { key: 'connections', label: 'Connections', render: (provider) => provider.connections, sortValue: (provider) => Number(provider.connections.replaceAll(',', '')) },
]

export function Providers() {
  const { me } = useSession()
  const providers = useOperations((state) => state.providers)
  const setProviderStatus = useOperations((state) => state.setProviderStatus)
  if (!me) return null
  if (!has(me.role, 'integrations.read')) return <RestrictedNotice permission="integrations.read" />

  const canManage = has(me.role, 'integrations.manage')
  const columns: Column<Provider>[] = canManage
    ? [...baseColumns, {
        key: 'actions',
        label: 'Action',
        render: (provider) => (
          <button
            onClick={() => setProviderStatus(provider.name, provider.status === 'Disabled' ? 'Healthy' : 'Disabled')}
            className="px-2 py-1 border border-app-border rounded text-xs hover:bg-app-hover"
          >
            {provider.status === 'Disabled' ? 'Enable' : 'Disable'}
          </button>
        ),
        sortValue: () => '',
      }]
    : baseColumns

  return (
    <div className="space-y-4">
      <header className="pb-4 border-b border-app-border">
        <h1 className="text-2xl font-bold mb-1">Providers</h1>
        <p className="text-sm text-app-muted">Integration health and connection performance.</p>
      </header>
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3" aria-label="Provider summary">
        <div className="border border-app-border bg-app-card p-4 rounded-lg"><p className="text-xs text-app-muted">Connected users</p><p className="text-xl font-semibold">20,157</p></div>
        <div className="border border-app-border bg-app-card p-4 rounded-lg"><p className="text-xs text-app-muted">Healthy providers</p><p className="text-xl font-semibold">{providers.filter((provider) => provider.status === 'Healthy').length} / {providers.length}</p></div>
        <div className="border border-app-border bg-app-card p-4 rounded-lg"><p className="text-xs text-app-muted">Open API errors</p><p className="text-xl font-semibold">{providers.reduce((total, provider) => total + provider.apiErrors, 0)}</p></div>
      </section>
      <div className="border border-app-border bg-app-card rounded-lg p-4">
        <DataTable rows={providers} columns={columns} rowKey={(provider) => provider.name} />
      </div>
    </div>
  )
}