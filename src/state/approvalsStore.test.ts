import { describe, it, expect, beforeEach } from 'vitest'
import { useApprovals } from './approvalsStore'
import type { Admin } from '../lib/permissions'

const requester: Admin = { name: 'Halima Sani', email: 'halima.sani@kobo.com', role: 'Risk Admin', mfa: 'Enabled', status: 'Active', lastActive: 'Now' }
const otherApprover: Admin = { name: 'Amara Obi', email: 'amara.obi@kobo.com', role: 'Super Admin', mfa: 'Enabled', status: 'Active', lastActive: 'Now' }
const noPermAdmin: Admin = { name: 'Ngozi Eze', email: 'ngozi.eze@kobo.com', role: 'Analyst', mfa: 'Enabled', status: 'Active', lastActive: 'Now' }

function makeRequest() {
  let executed = false
  const id = useApprovals.getState().request({
    action: 'users.suspend',
    target: 'USR-1061',
    reason: 'test',
    requestedBy: { name: requester.name, email: requester.email, role: requester.role },
    requiredPermission: 'users.suspend',
    onApprove: () => {
      executed = true
    },
  })
  return { id, wasExecuted: () => executed }
}

beforeEach(() => {
  useApprovals.setState({ requests: [] })
})

describe('approvals engine', () => {
  it('the reported bug: cannot approve your own request under any role', () => {
    const { id, wasExecuted } = makeRequest()

    // This is exactly the scenario that broke in the single-file prototype:
    // the requester, now "viewing as" Super Admin (every permission), tries
    // to approve their own request. Because there is only one identity
    // source (the session store) and no separate role-preview control, this
    // must still be blocked.
    const asSuperAdminButStillMe: Admin = { ...requester, role: 'Super Admin' }
    const result = useApprovals.getState().approve(id, asSuperAdminButStillMe)

    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/different admin has to approve/i)
    expect(wasExecuted()).toBe(false)
    expect(useApprovals.getState().requests[0].status).toBe('Pending')
  })

  it('a genuinely different admin with permission can approve', () => {
    const { id, wasExecuted } = makeRequest()
    const result = useApprovals.getState().approve(id, otherApprover)

    expect(result.ok).toBe(true)
    expect(wasExecuted()).toBe(true)
    expect(useApprovals.getState().requests[0].status).toBe('Approved')
  })

  it('an admin without approvals.decide cannot approve', () => {
    const { id } = makeRequest()
    const result = useApprovals.getState().approve(id, noPermAdmin)

    expect(result.ok).toBe(false)
    expect(useApprovals.getState().requests[0].status).toBe('Pending')
  })

  it('only the requester can cancel their own request', () => {
    const { id } = makeRequest()
    expect(useApprovals.getState().cancel(id, otherApprover).ok).toBe(false)
    expect(useApprovals.getState().cancel(id, requester).ok).toBe(true)
    expect(useApprovals.getState().requests[0].status).toBe('Cancelled')
  })

  it('canDecide reflects both identity and permission', () => {
    const { id } = makeRequest()
    const r = useApprovals.getState().requests.find((x) => x.id === id)!
    expect(useApprovals.getState().canDecide(r, requester)).toBe(false) // self
    expect(useApprovals.getState().canDecide(r, noPermAdmin)).toBe(false) // no permission
    expect(useApprovals.getState().canDecide(r, otherApprover)).toBe(true)
  })
})
