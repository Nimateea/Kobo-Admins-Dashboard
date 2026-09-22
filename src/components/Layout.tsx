import { type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useSession } from '../state/sessionStore'
import { has } from '../lib/permissions'

const NAV: Array<{ label: string; to: string; permission: Parameters<typeof has>[1] }> = [
  { label: 'Command Centre', to: '/', permission: null },
  { label: 'Users', to: '/users', permission: 'users.read' },
  { label: 'Approvals', to: '/approvals', permission: 'approvals.decide' },
]

export function Layout({ children }: { children: ReactNode }) {
  const { me, logout } = useSession()
  if (!me) return null

  return (
    <div className="h-full flex bg-app-main text-app-text">
      <aside
        aria-label="Primary"
        className="w-[260px] bg-app-sidebar flex-shrink-0 flex flex-col border-r border-app-border"
      >
        <div className="px-6 py-6 text-lg font-semibold tracking-tight">Admin</div>
        <nav className="px-4 flex-1 space-y-1">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                  isActive
                    ? 'bg-app-hover text-app-text font-medium'
                    : 'text-app-muted hover:text-app-text hover:bg-app-hover'
                }`
              }
            >
              <span className="flex-1">{n.label}</span>
              {!has(me.role, n.permission) && <span aria-hidden="true">🔒</span>}
            </NavLink>
          ))}
        </nav>
        <div className="m-4 rounded-2xl p-4 border border-app-border">
          <p className="text-sm font-semibold">{me.name}</p>
          <p className="text-xs text-app-muted">{me.role}</p>
          <p className="text-[11px] text-app-muted truncate">{me.email}</p>
          <button
            onClick={logout}
            className="w-full mt-3 py-2 bg-app-hover hover:bg-[#222] rounded-lg text-xs font-medium border border-app-border"
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[1200px] mx-auto p-8">{children}</div>
      </main>
    </div>
  )
}

export function RestrictedNotice({ permission }: { permission: string }) {
  return (
    <div className="text-center py-12 border border-app-border rounded-2xl bg-app-card">
      <p className="font-semibold mb-1">Access restricted</p>
      <p className="text-sm text-app-muted">
        Your role does not have the <span className="text-app-text">{permission}</span> permission.
      </p>
    </div>
  )
}
