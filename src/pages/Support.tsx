import { useState, type FormEvent } from 'react'
import { DataTable, type Column } from '../components/DataTable'
import { RestrictedNotice } from '../components/Layout'
import { TICKETS, type Ticket } from '../lib/mockData'
import { has } from '../lib/permissions'
import { useOperations } from '../state/operationsStore'
import { useSession } from '../state/sessionStore'

const ticketColumns: Column<Ticket>[] = [
  { key: 'id', label: 'Ticket', render: (ticket) => ticket.id, sortValue: (ticket) => ticket.id },
  { key: 'category', label: 'Category', render: (ticket) => ticket.category, sortValue: (ticket) => ticket.category },
  { key: 'user', label: 'User', render: (ticket) => ticket.userId, sortValue: (ticket) => ticket.userId },
  { key: 'priority', label: 'Priority', render: (ticket) => ticket.priority, sortValue: (ticket) => ticket.priority },
  { key: 'status', label: 'Status', render: (ticket) => ticket.status, sortValue: (ticket) => ticket.status },
  { key: 'age', label: 'Age', render: (ticket) => ticket.age, sortValue: (ticket) => ticket.age },
]

export function Support() {
  const { me } = useSession()
  const tickets = useOperations((state) => state.tickets)
  const replies = useOperations((state) => state.replies)
  const updateTicketInStore = useOperations((state) => state.updateTicket)
  const addTicketReply = useOperations((state) => state.addTicketReply)
  const [selectedId, setSelectedId] = useState(TICKETS[0]?.id ?? '')
  const [draft, setDraft] = useState('')
  if (!me) return null
  if (!has(me.role, 'support.read')) return <RestrictedNotice permission="support.read" />

  const currentAdmin = me
  const ticket = tickets.find((row) => row.id === selectedId)
  const canManage = has(me.role, 'support.manage')

  function updateTicket(change: Partial<Ticket>) {
    updateTicketInStore(selectedId, change)
  }

  function sendReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const body = draft.trim()
    if (!body || !ticket || !canManage) return
    addTicketReply(ticket.id, { author: currentAdmin.name, body, time: 'Now' })
    setDraft('')
  }

  return (
    <div className="space-y-4">
      <header className="pb-4 border-b border-app-border">
        <h1 className="text-2xl font-bold mb-1">Support</h1>
        <p className="text-sm text-app-muted">Ticket queue and customer conversation history.</p>
      </header>
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.5fr)_minmax(280px,1fr)] gap-4 items-start">
        <div className="border border-app-border bg-app-card rounded-lg p-4">
          <DataTable rows={tickets} columns={ticketColumns} rowKey={(row) => row.id} onRowClick={(row) => setSelectedId(row.id)} />
        </div>
        {ticket && (
          <section className="border border-app-border bg-app-card rounded-lg p-4 space-y-4" aria-label={`Ticket ${ticket.id}`}>
            <header className="flex items-start justify-between gap-3">
              <div><p className="text-xs text-app-muted">{ticket.id} · {ticket.userId}</p><h2 className="font-semibold mt-1">{ticket.category}</h2></div>
              <span className="text-xs text-app-muted">{ticket.priority} priority</span>
            </header>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs text-app-muted">Status
                <select aria-label="Ticket status" disabled={!canManage} value={ticket.status} onChange={(event) => updateTicket({ status: event.target.value as Ticket['status'] })} className="block w-full mt-1 bg-app-main text-app-text border border-app-border rounded px-2 py-1.5 disabled:opacity-60">
                  {['New', 'Open', 'Waiting', 'Escalated', 'Resolved', 'Closed'].map((status) => <option key={status}>{status}</option>)}
                </select>
              </label>
              <label className="text-xs text-app-muted">Assignee
                <select aria-label="Ticket assignee" disabled={!canManage} value={ticket.assignee} onChange={(event) => updateTicket({ assignee: event.target.value })} className="block w-full mt-1 bg-app-main text-app-text border border-app-border rounded px-2 py-1.5 disabled:opacity-60">
                  {['Unassigned', 'Funmi A.', 'Chidi O.'].map((assignee) => <option key={assignee}>{assignee}</option>)}
                </select>
              </label>
            </div>
            <div className="border-t border-app-border pt-3 space-y-3" aria-label="Conversation">
              {(replies[ticket.id] ?? []).map((reply, index) => (
                <article key={`${ticket.id}-${index}`} className="text-sm">
                  <p className="text-xs text-app-muted mb-1">{reply.author} · {reply.time}</p>
                  <p>{reply.body}</p>
                </article>
              ))}
              {(replies[ticket.id] ?? []).length === 0 && <p className="text-xs text-app-muted">No replies yet.</p>}
            </div>
            {canManage ? (
              <form onSubmit={sendReply} className="space-y-2">
                <label htmlFor="ticket-reply" className="sr-only">Message</label>
                <textarea id="ticket-reply" aria-label="Message" value={draft} onChange={(event) => setDraft(event.target.value)} rows={3} placeholder="Write a reply" className="w-full resize-y bg-app-main border border-app-border rounded p-2 text-sm" />
                <button type="submit" disabled={!draft.trim()} className="px-3 py-1.5 border border-app-border rounded text-xs font-medium hover:bg-app-hover disabled:opacity-50">Send reply</button>
              </form>
            ) : <p className="text-xs text-app-muted">This role can view tickets but cannot reply or reassign them.</p>}
          </section>
        )}
      </div>
    </div>
  )
}