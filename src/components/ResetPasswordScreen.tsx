import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function ResetPasswordScreen() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const [resetToken, setResetToken] = useState<string | null>(null)
  const [reuseBlocked, setReuseBlocked] = useState(false)

  useEffect(() => {
    const run = async () => {
      const url = new URL(window.location.href)
      const code = url.searchParams.get('code')
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')
      const token = code ?? accessToken ?? null
      setResetToken(token)

      if (token) {
        const usedToken = localStorage.getItem('fc26-reset-used-token')
        if (usedToken === token) {
          setError('This reset link was already used. Request a new reset email.')
          setSessionReady(false)
          setReuseBlocked(true)
          return
        }
      }

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
        if (error) {
          setError(error.message)
          setSessionReady(false)
          return
        }
        url.hash = ''
        window.history.replaceState({}, '', url.toString())
      }

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          setError(error.message)
          setSessionReady(false)
          return
        }
        url.searchParams.delete('code')
        window.history.replaceState({}, '', url.toString())
      }

      const { data } = await supabase.auth.getSession()
      if (data.session) {
        setSessionReady(true)
      } else {
        setSessionReady(false)
        setError('Reset link expired. Request a new reset email.')
      }
    }

    void run()
  }, [])

  const handleUpdate = async () => {
    if (!sessionReady) {
      setError('Reset link expired. Request a new reset email.')
      return
    }
    if (!password) {
      setError('Enter a new password.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) {
        setError(updateError.message.includes('Auth session missing')
          ? 'Session missing. Open the reset link from your email again.'
          : updateError.message
        )
        return
      }
      if (resetToken) {
        localStorage.setItem('fc26-reset-used-token', resetToken)
      }
      await supabase.auth.signOut()
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToSignIn = async () => {
    setIsRedirecting(true)
    await supabase.auth.signOut()
    window.location.replace('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-card bg-white dark:bg-gray-800 shadow-card dark:shadow-none dark:border dark:border-gray-700 p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Reset password</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Enter a new password to regain access.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">New password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="New password"
              className="mt-2 w-full rounded-button border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:border-neobank-lime focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Confirm password</label>
            <input
              type="password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              placeholder="Confirm password"
              className="mt-2 w-full rounded-button border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:border-neobank-lime focus:outline-none"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-card border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-700/50 dark:bg-red-900/30 dark:text-red-200">
            {error}
          </div>
        )}

        {success ? (
          <div className="space-y-3">
            <div className="rounded-card border border-neobank-lime/40 bg-neobank-lime/10 px-4 py-3 text-sm text-neobank-lime">
              Password updated. Please sign in with your new password.
            </div>
            <button
              type="button"
              onClick={handleBackToSignIn}
              disabled={isRedirecting}
              className="rounded-button bg-gray-900 dark:bg-gray-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              {isRedirecting ? 'Returning...' : 'Back to sign in'}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleUpdate}
            disabled={isLoading || !sessionReady || reuseBlocked}
            className="rounded-button bg-neobank-lime px-4 py-2.5 text-sm font-semibold text-white hover:bg-neobank-lime-dark disabled:opacity-50"
          >
            {isLoading ? 'Updating...' : 'Update password'}
          </button>
        )}
      </div>
    </div>
  )
}
