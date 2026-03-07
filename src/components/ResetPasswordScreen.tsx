import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function ResetPasswordScreen() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const url = new URL(window.location.href)
    const code = url.searchParams.get('code')
    if (!code) return

    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) {
        setError(error.message)
      } else {
        url.searchParams.delete('code')
        window.history.replaceState({}, '', url.toString())
      }
    })
  }, [])

  const handleUpdate = async () => {
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
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password.')
    } finally {
      setIsLoading(false)
    }
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
          <div className="rounded-card border border-neobank-lime/40 bg-neobank-lime/10 px-4 py-3 text-sm text-neobank-lime">
            Password updated. You can sign in now.
          </div>
        ) : (
          <button
            type="button"
            onClick={handleUpdate}
            disabled={isLoading}
            className="rounded-button bg-neobank-lime px-4 py-2.5 text-sm font-semibold text-white hover:bg-neobank-lime-dark disabled:opacity-50"
          >
            {isLoading ? 'Updating...' : 'Update password'}
          </button>
        )}
      </div>
    </div>
  )
}
