// Action-based permission model.
// ROLES maps a role name to either '*' (every permission) or an explicit list.
// This mirrors the single-file prototype's ROLES object so behaviour matches exactly.

export const PERMISSIONS = [
  'users.read', 'users.update', 'users.suspend',
  'transactions.read', 'transactions.adjust',
  'accounts.read', 'accounts.disconnect',
  'data.export',
  'integrations.read', 'integrations.manage',
  'ai.read',
  'support.read', 'support.manage',
  'risk.read', 'risk.manage',
  'settings.read', 'settings.update',
  'admins.read', 'admins.update',
  'audit_logs.read', 'audit_logs.export',
  'analytics.read',
  'approvals.decide',
] as const

export type Permission = typeof PERMISSIONS[number]

export const ROLES: Record<string, '*' | Permission[]> = {
  'Super Admin': '*',
  'Support Admin': [
    'users.read', 'users.update', 'transactions.read', 'accounts.read',
    'accounts.disconnect', 'integrations.read', 'ai.read', 'support.read',
    'support.manage',
  ],
  'Finance/Ops Admin': [
    'users.read', 'transactions.read', 'transactions.adjust', 'data.export',
    'accounts.read', 'accounts.disconnect', 'integrations.read',
    'integrations.manage', 'support.read', 'analytics.read',
  ],
  'Risk Admin': [
    'users.read', 'users.suspend', 'accounts.read', 'risk.read',
    'risk.manage', 'audit_logs.read', 'approvals.decide',
  ],
  'Analyst': ['analytics.read'],
}

export function has(role: string, permission: Permission | null | undefined): boolean {
  if (!permission) return true
  const grant = ROLES[role]
  if (!grant) return false
  return grant === '*' || grant.includes(permission)
}

export interface Admin {
  name: string
  email: string
  role: string
  mfa: 'Enabled' | 'Not set'
  status: 'Active' | 'Pending' | 'Suspended'
  lastActive: string
}

// Seed admin roster — same people/emails as the single-file prototype so the
// demo accounts on the login screen line up with what you've already tested.
export const ADMINS: Admin[] = [
  { name: 'Amara Obi', email: 'amara.obi@kobo.com', role: 'Super Admin', mfa: 'Enabled', status: 'Active', lastActive: 'Now' },
  { name: 'Funmi Adebayo', email: 'funmi.adebayo@kobo.com', role: 'Support Admin', mfa: 'Enabled', status: 'Active', lastActive: '12m ago' },
  { name: 'Chidi Okeke', email: 'chidi.okeke@kobo.com', role: 'Finance/Ops Admin', mfa: 'Enabled', status: 'Active', lastActive: '1h ago' },
  { name: 'Halima Sani', email: 'halima.sani@kobo.com', role: 'Risk Admin', mfa: 'Enabled', status: 'Active', lastActive: '3h ago' },
  { name: 'Ngozi Eze', email: 'ngozi.eze@kobo.com', role: 'Analyst', mfa: 'Enabled', status: 'Active', lastActive: '5h ago' },
  { name: 'Dev Rotimi', email: 'dev.rotimi@kobo.com', role: 'Analyst', mfa: 'Not set', status: 'Suspended', lastActive: '6d ago' },
]
