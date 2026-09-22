import { create } from 'zustand'
import type { Admin } from '../lib/permissions'
import { has, type Permission } from '../lib/permissions'

export interface ApprovalRequest {
  id: string
  action: string
  target: string
  reason: string
  requestedBy: Pick<Admin, 'name' | 'email' | 'role'>
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled'
  requiredPermission: Permission
  /** Runs the effect once approved. Kept out of persisted state in the real port. */
  onApprove: () => void
}

interface ApprovalsState {
  requests: ApprovalRequest[]
  request: (r: Omit<ApprovalRequest, 'id' | 'status'>) => string
  /**
   * Approve a request. `decidedBy` is always the CURRENT SESSION's admin
   * (see sessionStore) — there is no other identity source, which is what
   * makes self-approval impossible to bypass by "previewing" a role.
   */
  approve: (id: string, decidedBy: Admin) => { ok: boolean; error?: string }
  reject: (id: string, decidedBy: Admin) => { ok: boolean; error?: string }
  cancel: (id: string, cancelledBy: Admin) => { ok: boolean; error?: string }
  canDecide: (r: ApprovalRequest, viewer: Admin) => boolean
}

export const useApprovals = create<ApprovalsState>((set, get) => ({
  requests: [],
  request: (r) => {
    const id = 'APR-' + Math.random().toString(36).slice(2, 8).toUpperCase()
    set((s) => ({ requests: [{ ...r, id, status: 'Pending' }, ...s.requests] }))
    return id
  },
  canDecide: (r, viewer) => {
    if (r.status !== 'Pending') return false
    if (r.requestedBy.email === viewer.email) return false // <-- the bug-fix invariant
    return has(viewer.role, 'approvals.decide')
  },
  approve: (id, decidedBy) => {
    const r = get().requests.find((x) => x.id === id)
    if (!r) return { ok: false, error: 'Request not found' }
    if (!get().canDecide(r, decidedBy)) {
      return {
        ok: false,
        error:
          r.requestedBy.email === decidedBy.email
            ? 'You made this request, so a different admin has to approve it.'
            : 'You do not have permission to approve requests.',
      }
    }
    r.onApprove()
    set((s) => ({
      requests: s.requests.map((x) => (x.id === id ? { ...x, status: 'Approved' } : x)),
    }))
    return { ok: true }
  },
  reject: (id, decidedBy) => {
    const r = get().requests.find((x) => x.id === id)
    if (!r) return { ok: false, error: 'Request not found' }
    if (!get().canDecide(r, decidedBy)) {
      return { ok: false, error: 'You cannot decide on this request.' }
    }
    set((s) => ({
      requests: s.requests.map((x) => (x.id === id ? { ...x, status: 'Rejected' } : x)),
    }))
    return { ok: true }
  },
  cancel: (id, cancelledBy) => {
    const r = get().requests.find((x) => x.id === id)
    if (!r) return { ok: false, error: 'Request not found' }
    if (r.requestedBy.email !== cancelledBy.email) {
      return { ok: false, error: 'Only the requester can cancel this.' }
    }
    set((s) => ({
      requests: s.requests.map((x) => (x.id === id ? { ...x, status: 'Cancelled' } : x)),
    }))
    return { ok: true }
  },
}))
