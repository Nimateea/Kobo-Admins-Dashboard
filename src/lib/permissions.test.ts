import { describe, it, expect } from 'vitest'
import { has, ROLES } from './permissions'

describe('permissions', () => {
  it('Super Admin has every permission', () => {
    expect(has('Super Admin', 'admins.update')).toBe(true)
    expect(has('Super Admin', 'audit_logs.export')).toBe(true)
  })

  it('Analyst only has analytics.read', () => {
    expect(has('Analyst', 'analytics.read')).toBe(true)
    expect(has('Analyst', 'users.read')).toBe(false)
  })

  it('a null permission always passes (public views)', () => {
    expect(has('Analyst', null)).toBe(true)
  })

  it('an unknown role has no permissions', () => {
    expect(has('Nonexistent Role', 'users.read')).toBe(false)
  })

  it('every role referenced in ROLES is a real, non-empty grant', () => {
    for (const [role, grant] of Object.entries(ROLES)) {
      expect(grant === '*' || grant.length > 0, `${role} has an empty grant`).toBe(true)
    }
  })
})
