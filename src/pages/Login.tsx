import { useState } from 'react'
import { useSession } from '../state/sessionStore'
import { ADMINS } from '../lib/permissions'

export function Login() {
  const { login, loginError } = useSession()
  const [email, setEmail] = useState('amara.obi@kobo.com')
  const [step, setStep] = useState<'signin' | 'mfa'>('signin')
  const [code, setCode] = useState('')
  const [codeError, setCodeError] = useState('')

  function handleContinue(e: React.FormEvent) {
    e.preventDefault()
    setStep('mfa')
  }

  function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    if (code.length !== 6) {
      setCodeError('Enter the 6-digit code.')
      return
    }
    if (code === '000000') {
      setCodeError('Invalid code. Try again.')
      return
    }
    const ok = login(email)
    if (!ok) {
      // loginError is set by the store; drop back to the sign-in step so it's visible.
      setStep('signin')
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Sign in"
      className="fixed inset-0 bg-app-main flex items-center justify-center"
    >
      <div className="w-full max-w-sm bg-app-card border border-app-border rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-lg font-semibold">Admin</span>
        </div>

        {step === 'signin' ? (
          <form onSubmit={handleContinue}>
            <h1 className="text-xl font-bold mb-1">Sign in</h1>
            <p className="text-sm text-app-muted mb-5">
              Authorized Kobo staff only.
            </p>
            <label htmlFor="email" className="sr-only">Work email</label>
            <input
              id="email"
              aria-label="Work email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mb-3 bg-app-main border border-app-border rounded-lg p-2.5 text-sm outline-none focus:border-app-accent"
            />
            <p className="text-xs text-red-500 mb-2 h-4">{loginError}</p>
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg text-sm font-bold bg-white text-black hover:bg-gray-200"
            >
              Continue
            </button>
            <div className="mt-4 flex flex-wrap gap-2">
              {ADMINS.filter((a) => a.status === 'Active').map((a) => (
                <button
                  key={a.email}
                  type="button"
                  onClick={() => setEmail(a.email)}
                  className="px-2 py-1 rounded-md text-[11px] border border-app-border text-app-muted hover:text-app-text"
                >
                  {a.role}
                </button>
              ))}
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerify}>
            <h1 className="text-xl font-bold mb-1">Two-factor verification</h1>
            <p className="text-sm text-app-muted mb-5">
              Enter the 6-digit code from your authenticator app (demo: any 6
              digits except 000000).
            </p>
            <label htmlFor="mfa" className="sr-only">6-digit verification code</label>
            <input
              id="mfa"
              aria-label="6-digit verification code"
              maxLength={6}
              inputMode="numeric"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="••••••"
              className="w-full bg-app-main border border-app-border rounded-lg p-3 text-center text-lg tracking-[0.5em] outline-none focus:border-app-accent"
            />
            <p className="text-xs text-red-500 my-2 h-4">{codeError}</p>
            <button
              type="submit"
              disabled={code.length !== 6}
              className="w-full py-2.5 rounded-lg text-sm font-bold bg-white text-black hover:bg-gray-200 disabled:opacity-40"
            >
              Verify &amp; continue
            </button>
            <button
              type="button"
              onClick={() => setStep('signin')}
              className="w-full mt-3 text-xs text-app-muted hover:text-white"
            >
              Back to sign in
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
