import { create } from 'zustand'
import { ADMINS, type Admin } from '../lib/permissions'

interface SessionState {
  me: Admin | null
  loginError: string | null
  login: (email: string) => boolean
  logout: () => void
}

// This store is the fix for the bug you found in the single-file prototype:
// there is exactly ONE place that can change "who you are" (login), and no
// separate "preview as a role" control that can drift out of sync with it.
// Every permission check and every approval's "is this my own request?"
// check reads `me` from here, so they can never disagree.
export const useSession = create<SessionState>((set) => ({
  me: null,
  loginError: null,
  login: (email: string) => {
    const admin = ADMINS.find((a) => a.email.toLowerCase() === email.trim().toLowerCase())
    if (!admin) {
      set({ loginError: 'No admin account found for that email.' })
      return false
    }
    if (admin.status === 'Suspended') {
      set({ loginError: `${admin.name}'s account is suspended.` })
      return false
    }
    set({ me: admin, loginError: null })
    return true
  },
  logout: () => set({ me: null, loginError: null }),
}))
