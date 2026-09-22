const KPIS = [
  { label: 'Total Users', value: '48,210', detail: 'Registered accounts' },
  { label: 'Active Users', value: '31,882', detail: '66% of total' },
  { label: 'Open Support Issues', value: '42', detail: '6 escalated' },
]

export function CommandCentre() {
  return (
    <div className="space-y-4">
      <header className="pb-4 border-b border-app-border">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Command Centre</h1>
        <p className="text-sm text-app-muted">What is happening across Kobo right now?</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {KPIS.map((k) => (
          <div key={k.label} className="bg-app-card border border-app-border rounded-2xl p-5">
            <p className="text-sm text-app-muted mb-2">{k.label}</p>
            <p className="text-3xl font-bold mb-2">{k.value}</p>
            <p className="text-xs text-app-muted">{k.detail}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
