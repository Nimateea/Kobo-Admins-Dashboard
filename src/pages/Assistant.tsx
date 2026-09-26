import { useState, type FormEvent } from 'react'
import { RestrictedNotice } from '../components/Layout'
import { PROVIDERS, RISK_EVENTS, TICKETS, TRANSACTIONS, USERS } from '../lib/mockData'
import { has } from '../lib/permissions'
import { useSession } from '../state/sessionStore'

interface Message {
  role: 'admin' | 'assistant'
  content: string
}

function answerQuestion(question: string): string {
  const query = question.toLowerCase()
  if (query.includes('ticket') || query.includes('support')) {
    const open = TICKETS.filter((ticket) => !['Resolved', 'Closed'].includes(ticket.status))
    const escalated = open.filter((ticket) => ticket.status === 'Escalated').length
    return `There are ${open.length} open support tickets in the sample data, including ${escalated} escalated ticket${escalated === 1 ? '' : 's'}.`
  }
  if (query.includes('risk') || query.includes('security')) {
    const open = RISK_EVENTS.filter((event) => event.status !== 'Resolved')
    return `${open.length} risk signals remain unresolved: ${open.map((event) => `${event.id} (${event.severity})`).join(', ')}.`
  }
  if (query.includes('provider') || query.includes('integration')) {
    const attention = PROVIDERS.filter((provider) => ['Warning', 'Degraded'].includes(provider.status))
    return attention.length ? `Providers needing attention: ${attention.map((provider) => `${provider.name} (${provider.status})`).join(', ')}.` : 'All sample providers are healthy.'
  }
  if (query.includes('transaction') || query.includes('payment')) {
    const flagged = TRANSACTIONS.filter((transaction) => transaction.status === 'Flagged')
    return `${TRANSACTIONS.length} sample transactions are listed; ${flagged.length} are flagged for review.`
  }
  const user = USERS.find((candidate) => query.includes(candidate.id.toLowerCase()) || query.includes(candidate.email.toLowerCase()))
  if (user) return `${user.name} (${user.id}) is ${user.status}, has ${user.accounts} linked accounts, and is marked ${user.risk} risk.`
  return `The sample workspace contains ${USERS.length} users, ${TRANSACTIONS.length} transactions, ${TICKETS.length} tickets, and ${RISK_EVENTS.length} risk events. Ask about one of those areas for a focused summary.`
}

export function Assistant() {
  const { me } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [question, setQuestion] = useState('')
  if (!me) return null
  if (!has(me.role, 'ai.read')) return <RestrictedNotice permission="ai.read" />

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const content = question.trim()
    if (!content) return
    setMessages((current) => [...current, { role: 'admin', content }, { role: 'assistant', content: answerQuestion(content) }])
    setQuestion('')
  }

  return (
    <div className="space-y-4">
      <header className="pb-4 border-b border-app-border">
        <h1 className="text-2xl font-bold mb-1">Admin Assistant</h1>
        <p className="text-sm text-app-muted">Answers are computed from local sample data; no external AI service is connected.</p>
      </header>
      <section className="border border-app-border bg-app-card rounded-lg p-5 space-y-4" aria-label="Assistant conversation">
        <div className="space-y-3 min-h-20">
          {messages.length === 0 && <p className="text-sm text-app-muted">No conversation yet.</p>}
          {messages.map((message, index) => (
            <article key={index} className={`max-w-3xl border-l-2 pl-3 ${message.role === 'admin' ? 'border-emerald-500' : 'border-app-accent'}`}>
              <p className="text-[11px] uppercase text-app-muted mb-1">{message.role === 'admin' ? me.name : 'Assistant'}</p>
              <p className="text-sm">{message.content}</p>
            </article>
          ))}
        </div>
        <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2 border-t border-app-border pt-4">
          <label htmlFor="assistant-question" className="sr-only">Ask about dashboard data</label>
          <input id="assistant-question" aria-label="Ask about dashboard data" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask about users, transactions, tickets, or risk" className="flex-1 bg-app-main border border-app-border rounded px-3 py-2 text-sm" />
          <button disabled={!question.trim()} className="px-3 py-2 border border-app-border rounded text-sm font-medium hover:bg-app-hover disabled:opacity-50">Ask</button>
        </form>
      </section>
    </div>
  )
}