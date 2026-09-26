import { useState } from 'react'
import { DataTable, type Column } from '../components/DataTable'
import { RestrictedNotice } from '../components/Layout'
import { downloadCsv } from '../lib/exportCsv'
import { type Transaction } from '../lib/mockData'
import { has } from '../lib/permissions'
import { useApprovals } from '../state/approvalsStore'
import { useFinance } from '../state/financeStore'
import { useSession } from '../state/sessionStore'

export function Transactions() {
  const { me } = useSession()
  const { request, requests } = useApprovals()
  const transactions = useFinance((state) => state.transactions)
  const [status, setStatus] = useState('All')
  const [notice, setNotice] = useState('')
  if (!me) return null
  if (!has(me.role, 'transactions.read')) return <RestrictedNotice permission="transactions.read" />

  const canAdjust = has(me.role, 'transactions.adjust')
  const canExport = has(me.role, 'data.export')
  const rows = transactions.filter((transaction) => status === 'All' || transaction.status === status)
  const pendingTargets = new Set(requests.filter((item) => item.status === 'Pending' && item.action === 'transactions.adjust').map((item) => item.target))
  const columns: Column<Transaction>[] = [
    { key: 'id', label: 'Transaction', render: (transaction) => transaction.id, sortValue: (transaction) => transaction.id },
    { key: 'user', label: 'User', render: (transaction) => transaction.userId, sortValue: (transaction) => transaction.userId },
    { key: 'type', label: 'Type', render: (transaction) => transaction.type, sortValue: (transaction) => transaction.type },
    { key: 'amount', label: 'Amount', render: (transaction) => `${transaction.currency} ${transaction.amount.toLocaleString()}`, sortValue: (transaction) => transaction.amount },
    { key: 'provider', label: 'Provider', render: (transaction) => transaction.provider, sortValue: (transaction) => transaction.provider },
    { key: 'status', label: 'Status', render: (transaction) => transaction.status, sortValue: (transaction) => transaction.status },
    { key: 'date', label: 'Date', render: (transaction) => transaction.date, sortValue: (transaction) => transaction.date },
  ]
  if (canAdjust) columns.push({
    key: 'action',
    label: 'Action',
    render: (transaction) => transaction.status === 'Adjusted' ? 'Adjusted' : pendingTargets.has(transaction.id) ? 'Pending approval' : (
      <button
        onClick={() => {
          request({
            action: 'transactions.adjust',
            target: transaction.id,
            reason: `Review adjustment for ${transaction.id}`,
            requestedBy: { name: me.name, email: me.email, role: me.role },
            requiredPermission: 'transactions.adjust',
            onApprove: () => useFinance.getState().adjustTransaction(transaction.id),
          })
          setNotice(`Adjustment request submitted for ${transaction.id}.`)
        }}
        className="px-2 py-1 border border-app-border rounded text-xs hover:bg-app-hover"
      >Request adjustment</button>
    ),
    sortValue: () => '',
  })

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap justify-between items-end gap-3 pb-4 border-b border-app-border">
        <div><h1 className="text-2xl font-bold mb-1">Transactions</h1><p className="text-sm text-app-muted">Review payment activity and submit controlled adjustments.</p></div>
        <div className="flex gap-2 items-center">
          <label htmlFor="transaction-status" className="sr-only">Transaction status</label>
          <select id="transaction-status" aria-label="Transaction status" value={status} onChange={(event) => setStatus(event.target.value)} className="bg-app-main border border-app-border rounded px-2 py-1.5 text-xs">
            {['All', 'Completed', 'Pending', 'Failed', 'Flagged', 'Adjusted'].map((value) => <option key={value}>{value}</option>)}
          </select>
          {canExport && <button onClick={() => downloadCsv('transactions.csv', ['ID', 'User', 'Type', 'Amount', 'Currency', 'Status', 'Provider', 'Date'], rows.map((row) => [row.id, row.userId, row.type, row.amount, row.currency, row.status, row.provider, row.date]))} className="px-3 py-1.5 border border-app-border rounded text-xs hover:bg-app-hover">Export CSV</button>}
        </div>
      </header>
      {notice && <p role="status" className="text-sm text-emerald-400">{notice}</p>}
      <div className="border border-app-border bg-app-card rounded-lg p-4"><DataTable rows={rows} columns={columns} rowKey={(transaction) => transaction.id} /></div>
    </div>
  )
}