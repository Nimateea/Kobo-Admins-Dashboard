import { useState } from 'react'
import { RestrictedNotice } from '../components/Layout'
import { REPORTS, type ReportPeriod } from '../lib/analytics'
import { has } from '../lib/permissions'
import { useSession } from '../state/sessionStore'

export function Analytics() {
  const { me } = useSession()
  const [period, setPeriod] = useState<ReportPeriod>('7d')
  if (!me) return null
  if (!has(me.role, 'analytics.read')) return <RestrictedNotice permission="analytics.read" />

  const report = REPORTS[period]
  const maxValue = Math.max(...report.series.map((point) => point.value))

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap justify-between items-end gap-3 pb-4 border-b border-app-border">
        <div><h1 className="text-2xl font-bold mb-1">Analytics</h1><p className="text-sm text-app-muted">Usage and transaction trends from dashboard sample data.</p></div>
        <label className="text-xs text-app-muted">Period
          <select aria-label="Analytics period" value={period} onChange={(event) => setPeriod(event.target.value as ReportPeriod)} className="ml-2 bg-app-main text-app-text border border-app-border rounded px-2 py-1.5">
            <option value="7d">Last 7 days</option><option value="30d">Last 30 days</option><option value="90d">Last 90 days</option>
          </select>
        </label>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="border border-app-border bg-app-card rounded-lg p-4"><p className="text-xs text-app-muted">Transactions</p><p className="text-xl font-semibold mt-1">{report.transactions.toLocaleString()}</p></div>
        <div className="border border-app-border bg-app-card rounded-lg p-4"><p className="text-xs text-app-muted">Transaction volume</p><p className="text-xl font-semibold mt-1">{report.volume}</p></div>
        <div className="border border-app-border bg-app-card rounded-lg p-4"><p className="text-xs text-app-muted">Active users</p><p className="text-xl font-semibold mt-1">{report.activeUsers}</p></div>
      </div>
      <section className="border border-app-border bg-app-card rounded-lg p-5" aria-label="Transaction activity chart">
        <h2 className="font-semibold mb-5">Transaction activity</h2>
        <div className="flex items-end gap-3 h-48" role="img" aria-label={`Transaction activity for the last ${period}`}>
          {report.series.map((point) => (
            <div key={point.label} className="flex-1 h-full flex flex-col justify-end items-center gap-2">
              <div title={`${point.value}% relative activity`} className="w-full max-w-14 bg-emerald-500/80 rounded-t-sm" style={{ height: `${Math.max(8, point.value / maxValue * 100)}%` }} />
              <span className="text-[11px] text-app-muted">{point.label}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}