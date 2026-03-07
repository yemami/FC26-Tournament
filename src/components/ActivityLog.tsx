import { useEffect, useMemo, useState } from 'react'
import { useTournament } from '../context/TournamentContext'
import { supabase } from '../lib/supabase'
import { getActiveTournamentId, getActivityLog, setActorLabel } from '../lib/supabaseService'
import { describeActivity, type ActivityLogEntry } from '../lib/activity'

interface ActivityLogProps {
  isOpen: boolean
  onClose: () => void
  hasOngoingGame?: boolean
  onGoToOngoingGame?: () => void
}

export function ActivityLog({ isOpen, onClose, hasOngoingGame = false, onGoToOngoingGame }: ActivityLogProps) {
  const { matches, players } = useTournament()
  const [history, setHistory] = useState<ActivityLogEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [actorLabelInput, setActorLabelInput] = useState('')

  const matchMap = useMemo(() => new Map(matches.map((m) => [m.id, m])), [matches])
  const playerMap = useMemo(() => new Map(players.map((p) => [p.id, p])), [players])

  useEffect(() => {
    if (!isOpen) return
    void loadHistory()
    void loadProfileName()
  }, [isOpen])

  const loadProfileName = async () => {
    try {
      const { data } = await supabase.auth.getUser()
      const displayName =
        (data.user?.user_metadata?.display_name as string | undefined) ||
        (data.user?.user_metadata?.full_name as string | undefined) ||
        (data.user?.user_metadata?.name as string | undefined) ||
        ''
      if (displayName.trim()) {
        setActorLabelInput(displayName.trim())
        return
      }
      if (data.user?.email) {
        setActorLabelInput(data.user.email)
      } else if (data.user?.phone) {
        setActorLabelInput(data.user.phone)
      }
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    if (!isOpen) return
    let cancelled = false
    let channel: ReturnType<typeof supabase.channel> | null = null

    ;(async () => {
      const tournamentId = await getActiveTournamentId()
      if (cancelled || !tournamentId) return

      channel = supabase
        .channel(`activity-log-modal-${tournamentId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'activity_log',
            filter: `tournament_id=eq.${tournamentId}`,
          },
          (payload) => {
            const entry = payload.new as ActivityLogEntry
            setHistory((prev) => {
              if (prev.some((item) => item.id === entry.id)) return prev
              return [entry, ...prev]
            })
          }
        )
        .subscribe()
    })()

    return () => {
      cancelled = true
      if (channel) {
        void supabase.removeChannel(channel)
      }
    }
  }, [isOpen])

  const loadHistory = async () => {
    setIsLoading(true)
    try {
      const data = await getActivityLog()
      setHistory(data)
    } catch (error) {
      console.error('Failed to load activity log:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveActorLabel = () => {
    const trimmed = actorLabelInput.trim()
    if (!trimmed) return
    setActorLabel(trimmed)
    void supabase.auth.updateUser({ data: { display_name: trimmed } })
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Just now'
    const date = new Date(dateString)
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/70 p-4">
      <div className="w-full max-w-3xl max-h-[80vh] rounded-card bg-white dark:bg-gray-800 shadow-xl flex flex-col border border-gray-200 dark:border-gray-700 transition-colors">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 p-5">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Activity Log</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadHistory}
              className="rounded-button bg-gray-100 dark:bg-gray-700 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Refresh
            </button>
            {hasOngoingGame && onGoToOngoingGame && (
              <button
                type="button"
                onClick={onGoToOngoingGame}
                className="rounded-button bg-neobank-lime px-4 py-2 text-sm font-semibold text-white hover:bg-neobank-lime-dark transition-colors"
              >
                Back to Ongoing Game
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-button bg-gray-100 dark:bg-gray-700 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
        <div className="border-b border-gray-200 dark:border-gray-700 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Profile name</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">This label appears in the activity log for your changes.</p>
            </div>
            <div className="flex w-full max-w-sm items-center gap-2">
              <input
                type="text"
                value={actorLabelInput}
                onChange={(event) => setActorLabelInput(event.target.value)}
                placeholder="Enter your name"
                className="flex-1 rounded-button border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-neobank-lime focus:outline-none transition-colors"
              />
            <button
              type="button"
              onClick={handleSaveActorLabel}
              className="rounded-button bg-neobank-lime px-4 py-2 text-sm font-semibold text-white hover:bg-neobank-lime-dark transition-colors"
            >
              Save
            </button>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 dark:border-gray-700 border-t-neobank-lime"></div>
            </div>
          ) : history.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-500 dark:text-gray-400 font-medium">No activity yet.</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Edits and comments will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((entry) => {
                const summary = describeActivity(entry, matchMap, playerMap)
                return (
                  <div
                    key={entry.id}
                    className="rounded-card border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700/50 p-4 shadow-card dark:shadow-none hover:shadow-card-hover transition-shadow"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {summary.title}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{summary.roundLabel}</div>
                        <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">{summary.description}</div>
                        {summary.comment && (
                          <div className="mt-2 text-xs italic text-gray-500 dark:text-gray-400">&quot;{summary.comment}&quot;</div>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">{formatDate(entry.created_at)}</div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="rounded-full bg-gray-100 dark:bg-gray-600/50 px-2 py-0.5 font-medium text-gray-600 dark:text-gray-300">
                        {summary.actionLabel}
                      </span>
                      <span>by {summary.actor}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
