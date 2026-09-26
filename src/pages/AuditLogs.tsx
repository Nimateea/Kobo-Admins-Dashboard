import { useState } from 'react'
import { DataTable, type Column } from '../components/DataTable'
import { RestrictedNotice } from '../components/Layout'
import { downloadCsv } from '../lib/exportCsv'
import { AUDIT_LOGS, type AuditEvent } from '../lib/mockData'
import { has } from '../lib/permissions'
import { useSession } from '../state/sessionStore'

const columns: Column<AuditEvent>[] = [
  { key: 'time', label: 'Time', render: (event) => event.time, sortValue: (event) => event.time },
  { key: 'actor', label: 'Actor', render: (event) => event.actor, sortValue: (event) => event.actor },
  { key: 'action', label: 'Action', render: (event) => event.action, sortValue: (event) => event.action },
  { key: 'resource', label: 'Resource', render: (event) => event.resource, sortValue: (event) => event.resource },
  { key: 'result', label: 'Result', render: (event) => event.result, sortValue: (event) => event.result },
  { key: 'ip', label: 'IP address', render: (event) => event.ip, sortValue: (event) => event.ip },
]

export function AuditLogs() {
  const { me } = useSession()
  const [result, setResult] = useState('All')
  if (!me) return null
  if (!has(me.role, 'audit_logs.read')) return <RestrictedNotice permission="audit_logs.read" />

  const rows = AUDIT_LOGS.filter((event) => result === 'All' || event.result === result)
  const canExport = has(me.role, 'audit_logs.export')
  return (
    <div className="space-y-4">
      <header className="flex flex-wrap justify-between items-end gap-3 pb-4 border-b border-app-border">
        <div><h1 className="text-2xl font-bold mb-1">Audit Logs</h1><p className="text-sm text-app-muted">Recorded administrative activity and access outcomes.</p></div>
        <div className="flex gap-2">
          <label htmlFor="audit-result" className="sr-only">Audit result filter</label>
          <select id="audit-result" aria-label="Audit result filter" value={result} onChange={(event) => setResult(event.target.value)} className="bg-app-main border border-app-border rounded px-2 py-1.5 text-xs">
            {['All', 'Success', 'Denied', 'Pending'].map((value) => <option key={value}>{value}</option>)}
          </select>
          {canExport && <button onClick={() => downloadCsv('audit-logs.csv', ['ID', 'Time', 'Actor', 'Action', 'Resource', 'Result', 'IP'], rows.map((event) => [event.id, event.time, event.actor, event.action, event.resource, event.result, event.ip]))} className="px-3 py-1.5 border border-app-border rounded text-xs hover:bg-app-hover">Export CSV</button>}
        </div>
      </header>
      <div className="border border-app-border bg-app-card rounded-lg p-4"><DataTable rows={rows} columns={columns} rowKey={(event) => event.id} /></div>
    </div>
  )
}