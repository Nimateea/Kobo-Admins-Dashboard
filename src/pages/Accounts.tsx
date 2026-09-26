import { useState } from 'react'
import { DataTable, type Column } from '../components/DataTable'
import { RestrictedNotice } from '../components/Layout'
import { downloadCsv } from '../lib/exportCsv'
import { type LinkedAccount } from '../lib/mockData'
import { has } from '../lib/permissions'
import { useApprovals } from '../state/approvalsStore'
import { useFinance } from '../state/financeStore'
import { useSession } from '../state/sessionStore'

export function Accounts() {
  const { me } = useSession()
  const { request } = useApprovals()
  const accounts = useFinance((state) => state.accounts)
  const [notice, setNotice] = useState('')
  if (!me) return null
  if (!has(me.role, 'accounts.read')) return <RestrictedNotice permission="accounts.read" />

  const canDisconnect = has(me.role, 'accounts.disconnect')
  const canExport = has(me.role, 'data.export')
  const columns: Column<LinkedAccount>[] = [
    { key: 'id', label: 'Account', render: (account) => account.id, sortValue: (account) => account.id },
    { key: 'user', label: 'User', render: (account) => account.userId, sortValue: (account) => account.userId },
    { key: 'institution', label: 'Institution', render: (account) => account.institution, sortValue: (account) => account.institution },
    { key: 'type', label: 'Type', render: (account) => account.type, sortValue: (account) => account.type },
    { key: 'balance', label: 'Balance', render: (account) => `${account.currency} ${account.balance.toLocaleString()}`, sortValue: (account) => account.balance },
    { key: 'status', label: 'Status', render: (account) => account.status, sortValue: (account) => account.status },
    { key: 'sync', label: 'Last sync', render: (account) => account.lastSync, sortValue: (account) => account.lastSync },
  ]
  if (canDisconnect) columns.push({
    key: 'action',
    label: 'Action',
    render: (account) => account.status === 'Disconnected' ? 'Disconnected' : (
      <button
        onClick={() => {
          request({
            action: 'accounts.disconnect',
            target: account.id,
            reason: `Disconnect ${account.institution} account for ${account.userId}`,
            requestedBy: { name: me.name, email: me.email, role: me.role },
            requiredPermission: 'accounts.disconnect',
            onApprove: () => useFinance.getState().disconnectAccount(account.id),
          })
          setNotice(`Disconnect request submitted for ${account.id}.`)
        }}
        className="px-2 py-1 border border-app-border rounded text-xs hover:bg-app-hover"
      >Request disconnect</button>
    ),
    sortValue: () => '',
  })

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap justify-between items-end gap-3 pb-4 border-b border-app-border">
        <div><h1 className="text-2xl font-bold mb-1">Accounts</h1><p className="text-sm text-app-muted">Monitor connected financial accounts and sync health.</p></div>
        {canExport && <button onClick={() => downloadCsv('accounts.csv', ['ID', 'User', 'Institution', 'Type', 'Balance', 'Currency', 'Status', 'Last sync'], accounts.map((row) => [row.id, row.userId, row.institution, row.type, row.balance, row.currency, row.status, row.lastSync]))} className="px-3 py-1.5 border border-app-border rounded text-xs hover:bg-app-hover">Export CSV</button>}
      </header>
      {notice && <p role="status" className="text-sm text-emerald-400">{notice}</p>}
      <div className="border border-app-border bg-app-card rounded-lg p-4"><DataTable rows={accounts} columns={columns} rowKey={(account) => account.id} /></div>
    </div>
  )
}