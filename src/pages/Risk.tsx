import { useState } from 'react'
import { DataTable, type Column } from '../components/DataTable'
import { RestrictedNotice } from '../components/Layout'
import { type RiskEvent } from '../lib/mockData'
import { has } from '../lib/permissions'
import { useOperations } from '../state/operationsStore'
import { useSession } from '../state/sessionStore'

function buildColumns(canManage: boolean, updateStatus: (event: RiskEvent, status: RiskEvent['status']) => void): Column<RiskEvent>[] {
  const columns: Column<RiskEvent>[] = [
    { key: 'id', label: 'Event', render: (event) => event.id, sortValue: (event) => event.id },
    { key: 'type', label: 'Signal', render: (event) => event.type, sortValue: (event) => event.type },
    { key: 'subject', label: 'Subject', render: (event) => event.subjectId, sortValue: (event) => event.subjectId },
    { key: 'severity', label: 'Severity', render: (event) => event.severity, sortValue: (event) => event.severity },
    { key: 'status', label: 'Status', render: (event) => event.status, sortValue: (event) => event.status },
    { key: 'detected', label: 'Detected', render: (event) => event.detected, sortValue: (event) => event.detected },
  ]
  if (canManage) columns.push({
    key: 'actions',
    label: 'Action',
    render: (event) => event.status === 'Resolved' ? 'Resolved' : (
      <div className="flex gap-1">
        <button onClick={() => updateStatus(event, 'Escalated')} className="px-2 py-1 border border-app-border rounded text-xs hover:bg-app-hover">Escalate</button>
        <button onClick={() => updateStatus(event, 'Resolved')} className="px-2 py-1 border border-app-border rounded text-xs hover:bg-app-hover">Resolve</button>
      </div>
    ),
    sortValue: () => '',
  })
  return columns
}

export function Risk() {
  const { me } = useSession()
  const events = useOperations((state) => state.riskEvents)
  const setRiskStatus = useOperations((state) => state.setRiskStatus)
  const [severity, setSeverity] = useState('All')
  if (!me) return null
  if (!has(me.role, 'risk.read')) return <RestrictedNotice permission="risk.read" />

  const canManage = has(me.role, 'risk.manage')
  const rows = events.filter((event) => severity === 'All' || event.severity === severity)
  function updateStatus(target: RiskEvent, status: RiskEvent['status']) {
    setRiskStatus(target.id, status)
  }

  return (
    <div className="space-y-4">
      <header className="pb-4 border-b border-app-border">
        <h1 className="text-2xl font-bold mb-1">Risk &amp; Security</h1>
        <p className="text-sm text-app-muted">Investigate security signals and record their disposition.</p>
      </header>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-app-muted">{events.filter((event) => event.status !== 'Resolved').length} open signals</p>
        <label className="text-xs text-app-muted">Severity
          <select aria-label="Severity filter" value={severity} onChange={(event) => setSeverity(event.target.value)} className="ml-2 bg-app-main text-app-text border border-app-border rounded px-2 py-1.5">
            {['All', 'Low', 'Medium', 'High'].map((level) => <option key={level}>{level}</option>)}
          </select>
        </label>
      </div>
      <div className="border border-app-border bg-app-card rounded-lg p-4">
        <DataTable rows={rows} columns={buildColumns(canManage, updateStatus)} rowKey={(event) => event.id} />
      </div>
    </div>
  )
}