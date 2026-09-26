import { useState } from 'react'
import { REPORTS, type ReportPeriod } from '../lib/analytics'

export function CommandCentre() {
  const [period, setPeriod] = useState<ReportPeriod>('7d')
  const report = REPORTS[period]
  const kpis = [
    { label: 'Total Users', value: report.totalUsers, detail: 'Registered accounts' },
    { label: 'Active Users', value: report.activeUsers, detail: 'Active in selected period' },
    { label: 'Open Support Issues', value: report.openTickets, detail: 'Across the selected period' },
  ]

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3 pb-4 border-b border-app-border">
        <div><h1 className="text-2xl font-bold tracking-tight mb-1">Command Centre</h1><p className="text-sm text-app-muted">What is happening across Kobo right now?</p></div>
        <label className="text-xs text-app-muted">Period
          <select aria-label="Dashboard period" value={period} onChange={(event) => setPeriod(event.target.value as ReportPeriod)} className="ml-2 bg-app-main text-app-text border border-app-border rounded px-2 py-1.5">
            <option value="7d">Last 7 days</option><option value="30d">Last 30 days</option><option value="90d">Last 90 days</option>
          </select>
        </label>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="bg-app-card border border-app-border rounded-lg p-5">
            <p className="text-sm text-app-muted mb-2">{k.label}</p>
            <p className="text-3xl font-bold mb-2">{k.value}</p>
            <p className="text-xs text-app-muted">{k.detail}</p>
          </div>
        ))}
      </div>
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4" aria-label="Period overview">
        <div className="border border-app-border bg-app-card rounded-lg p-5"><p className="text-sm text-app-muted">Transactions</p><p className="text-2xl font-semibold mt-2">{report.transactions.toLocaleString()}</p></div>
        <div className="border border-app-border bg-app-card rounded-lg p-5"><p className="text-sm text-app-muted">Transaction volume</p><p className="text-2xl font-semibold mt-2">{report.volume}</p></div>
      </section>
    </div>
  )
}
