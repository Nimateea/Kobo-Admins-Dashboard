import { RestrictedNotice } from '../components/Layout'
import { has } from '../lib/permissions'
import { useOperations } from '../state/operationsStore'
import { useSession } from '../state/sessionStore'

export function FeatureFlags() {
  const { me } = useSession()
  const flags = useOperations((state) => state.featureFlags)
  const toggleFeatureFlag = useOperations((state) => state.toggleFeatureFlag)
  if (!me) return null
  if (!has(me.role, 'settings.read')) return <RestrictedNotice permission="settings.read" />
  const canUpdate = has(me.role, 'settings.update')

  return (
    <div className="space-y-4">
      <header className="pb-4 border-b border-app-border">
        <h1 className="text-2xl font-bold mb-1">Feature Flags</h1>
        <p className="text-sm text-app-muted">Manage staged feature availability.</p>
      </header>
      <div className="border border-app-border bg-app-card rounded-lg divide-y divide-app-border">
        {flags.map((flag) => (
          <div key={flag.key} className="p-4 flex flex-wrap items-center justify-between gap-4">
            <div><p className="font-medium text-sm">{flag.key}</p><p className="text-xs text-app-muted mt-1">{flag.description} · {flag.environment}</p></div>
            <button
              type="button"
              role="switch"
              aria-label={`${flag.enabled ? 'Disable' : 'Enable'} ${flag.key}`}
              aria-checked={flag.enabled}
              disabled={!canUpdate}
              onClick={() => toggleFeatureFlag(flag.key)}
              className={`w-12 h-7 rounded-full border border-app-border relative disabled:opacity-50 ${flag.enabled ? 'bg-emerald-600' : 'bg-app-hover'}`}
            >
              <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${flag.enabled ? 'translate-x-5' : 'translate-x-1'}`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}