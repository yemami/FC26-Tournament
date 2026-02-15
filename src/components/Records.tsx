import { useState, useEffect } from 'react'
import { useTournament } from '../context/TournamentContext'
import { loadAllHistoricalMatches, getHistoricalPlayers } from '../lib/supabaseService'
import { computeRecords } from '../lib/records'
import type { Match, Player } from '../types'

interface RecordsProps {
  isOpen: boolean
  onClose: () => void
}

function RecordCard({
  title,
  value,
  unit,
  children,
}: {
  title: string
  value: number
  unit?: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-card border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-4">
      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
        {title}
      </h3>
      <div className="text-2xl font-bold text-neobank-lime mb-2">
        {value}
        {unit && <span className="text-lg font-normal text-gray-600 dark:text-gray-400 ml-1">{unit}</span>}
      </div>
      <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">{children}</div>
    </div>
  )
}

export function Records({ isOpen, onClose }: RecordsProps) {
  const { matches: currentMatches, players: currentPlayers } = useTournament()
  const [historicalMatches, setHistoricalMatches] = useState<Match[]>([])
  const [historicalPlayers, setHistoricalPlayers] = useState<Player[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true)
      Promise.all([loadAllHistoricalMatches(), getHistoricalPlayers()])
        .then(([matches, players]) => {
          setHistoricalMatches(matches)
          setHistoricalPlayers(players)
          setIsLoading(false)
        })
        .catch((error) => {
          console.error('Failed to load records data:', error)
          setIsLoading(false)
        })
    }
  }, [isOpen])

  const allMatchesMap = new Map<string, Match>()
  const allPlayersMap = new Map<string, Player>()
  currentMatches.forEach((m) => allMatchesMap.set(m.id, m))
  currentPlayers.forEach((p) => allPlayersMap.set(p.id, p))
  historicalMatches.forEach((m) => allMatchesMap.set(m.id, m))
  historicalPlayers.forEach((p) => allPlayersMap.set(p.id, p))
  const allMatches = Array.from(allMatchesMap.values())
  const allPlayers = Array.from(allPlayersMap.values())

  const records = computeRecords(allMatches, allPlayers)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/70 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] rounded-card bg-white dark:bg-gray-800 shadow-xl flex flex-col border border-gray-200 dark:border-gray-700 transition-colors">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 p-5">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Records</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-button bg-gray-100 dark:bg-gray-700 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {isLoading && (
            <div className="flex justify-center py-12">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 dark:border-gray-700 border-t-neobank-lime"></div>
            </div>
          )}

          {!isLoading && (
            <div className="space-y-4">
              <RecordCard
                title="Most goals in one game"
                value={records.mostGoalsInOneGame.value}
                unit="goals"
              >
                {records.mostGoalsInOneGame.entries.length === 0 ? (
                  <p className="text-gray-500">No matches yet</p>
                ) : (
                  records.mostGoalsInOneGame.entries.map((e, i) => (
                    <p key={i}>
                      <span className="font-semibold">{e.playerName}</span>
                      {e.opponentName && (
                        <>
                          {' '}vs {e.opponentName}
                          {e.score && <span className="text-gray-500"> ({e.score})</span>}
                        </>
                      )}
                    </p>
                  ))
                )}
              </RecordCard>

              <RecordCard
                title="Biggest win"
                value={records.biggestWin.value}
                unit="goal margin"
              >
                {records.biggestWin.entries.length === 0 ? (
                  <p className="text-gray-500">No matches yet</p>
                ) : (
                  records.biggestWin.entries.map((e, i) => (
                    <p key={i}>
                      <span className="font-semibold">{e.winnerName}</span> beat {e.loserName}
                      <span className="text-gray-500"> ({e.score})</span>
                    </p>
                  ))
                )}
              </RecordCard>

              <RecordCard
                title="Most total goals (all-time)"
                value={records.mostTotalGoals.value}
                unit="goals"
              >
                {records.mostTotalGoals.entries.length === 0 ? (
                  <p className="text-gray-500">No matches yet</p>
                ) : (
                  records.mostTotalGoals.entries.map((e, i) => (
                    <p key={i}>
                      <span className="font-semibold">{e.playerName}</span>
                    </p>
                  ))
                )}
              </RecordCard>

              <RecordCard
                title="Most wins (all-time)"
                value={records.mostWins.value}
                unit="wins"
              >
                {records.mostWins.entries.length === 0 ? (
                  <p className="text-gray-500">No matches yet</p>
                ) : (
                  records.mostWins.entries.map((e, i) => (
                    <p key={i}>
                      <span className="font-semibold">{e.playerName}</span>
                    </p>
                  ))
                )}
              </RecordCard>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
