import { useSession } from '../state/sessionStore'
import { useApprovals } from '../state/approvalsStore'
import { has } from '../lib/permissions'
import { RestrictedNotice } from '../components/Layout'

export function Approvals() {
  const { me } = useSession()
  const { requests, approve, reject, cancel, canDecide } = useApprovals()
  if (!me) return null
  if (!has(me.role, 'approvals.decide')) return <RestrictedNotice permission="approvals.decide" />

  return (
    <div className="space-y-4">
      <header className="pb-4 border-b border-app-border">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Approvals</h1>
        <p className="text-sm text-app-muted">
          Four-eyes control: a different admin must decide on your requests.
        </p>
      </header>

      <div className="space-y-3">
        {requests.length === 0 && (
          <p className="text-sm text-app-muted">No approval requests yet.</p>
        )}
        {requests.map((r) => {
          const mine = r.requestedBy.email === me.email
          const decidable = canDecide(r, me)
          return (
            <div key={r.id} className="bg-app-card border border-app-border rounded-2xl p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="font-medium text-sm">
                  {r.action} · {r.target}
                </p>
                <span className="text-xs text-app-muted">{r.status}</span>
              </div>
              <p className="text-xs text-app-muted mb-3">
                Requested by {r.requestedBy.name} · {r.reason}
              </p>
              {r.status === 'Pending' && (
                <div className="flex gap-2">
                  {decidable && (
                    <>
                      <button
                        onClick={() => approve(r.id, me)}
                        className="px-3 py-1.5 bg-app-main border border-app-border rounded-lg text-xs font-medium hover:bg-app-hover"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => reject(r.id, me)}
                        className="px-3 py-1.5 bg-app-main border border-red-500/40 text-red-500 rounded-lg text-xs font-medium hover:bg-red-500/10"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {mine && (
                    <button
                      onClick={() => cancel(r.id, me)}
                      className="px-3 py-1.5 bg-app-main border border-app-border rounded-lg text-xs font-medium hover:bg-app-hover"
                    >
                      Cancel request
                    </button>
                  )}
                  {mine && !decidable && (
                    <p className="text-xs text-amber-500 self-center">
                      You made this request, so a different admin has to approve it.
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
