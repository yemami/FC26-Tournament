import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { emitToast } from '../lib/toastBus'

type AuthMode = 'signin' | 'signup'

export function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [resetSent, setResetSent] = useState(false)

  const handleEmailAuth = async () => {
    const trimmedEmail = email.trim()
    const trimmedName = name.trim()

    if (!trimmedEmail) {
      setError('Enter your email.')
      return
    }
    if (!password) {
      setError('Enter your password.')
      return
    }
    if (mode === 'signup') {
      if (!trimmedName) {
        setError('Enter your name.')
        return
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.')
        return
      }
    }

    setIsLoading(true)
    setError(null)
    setInfo(null)

    try {
      if (mode === 'signup') {
        const { error: signUpError, data } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            data: { display_name: trimmedName },
          },
        })

        if (signUpError) {
          setError(signUpError.message)
          return
        }

        if (!data.session) {
          setInfo('Account created. If email confirmation is enabled, check your inbox to confirm.')
        } else {
          emitToast('Account created.', 'info')
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        })
        if (signInError) {
          setError(signInError.message)
          return
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordReset = async () => {
    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setError('Enter your email to reset your password.')
      return
    }

    setIsLoading(true)
    setError(null)
    setInfo(null)

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (resetError) {
        setError(resetError.message)
        return
      }
      setResetSent(true)
      setInfo('Password reset email sent. Check your inbox.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg rounded-card bg-white dark:bg-gray-800 shadow-card dark:shadow-none dark:border dark:border-gray-700 p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Sign in to Tournament</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Sign in to edit scores, comments, and see who changed what.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`flex-1 rounded-button px-4 py-2 text-sm font-semibold transition-colors ${
              mode === 'signin'
                ? 'bg-neobank-lime text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 rounded-button px-4 py-2 text-sm font-semibold transition-colors ${
              mode === 'signup'
                ? 'bg-neobank-lime text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Create account
          </button>
        </div>

        <div className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Your name</label>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter your name"
                className="mt-2 w-full rounded-button border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:border-neobank-lime focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@email.com"
              className="mt-2 w-full rounded-button border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:border-neobank-lime focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter a password"
              className="mt-2 w-full rounded-button border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:border-neobank-lime focus:outline-none"
            />
          </div>

          {mode === 'signup' && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Confirm your password"
                className="mt-2 w-full rounded-button border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:border-neobank-lime focus:outline-none"
              />
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-card border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-700/50 dark:bg-red-900/30 dark:text-red-200">
            {error}
          </div>
        )}
        {info && (
          <div className="rounded-card border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-700/40 dark:text-gray-300">
            {info}
          </div>
        )}

        <button
          type="button"
          onClick={handleEmailAuth}
          disabled={isLoading}
          className="rounded-button bg-neobank-lime px-4 py-2.5 text-sm font-semibold text-white hover:bg-neobank-lime-dark disabled:opacity-50"
        >
          {isLoading ? 'Working...' : mode === 'signup' ? 'Create account' : 'Sign in'}
        </button>
        {mode === 'signin' && (
          <button
            type="button"
            onClick={handlePasswordReset}
            disabled={isLoading}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400"
          >
            {resetSent ? 'Reset email sent' : 'Forgot password?'}
          </button>
        )}
      </div>
    </div>
  )
}
