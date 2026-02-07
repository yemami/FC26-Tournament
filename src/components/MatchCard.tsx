import { useState } from 'react'
import type { Match, Player } from '../types'
import { useTournament } from '../context/TournamentContext'
import { ScoreInput } from './ScoreInput'

interface MatchCardProps {
  match: Match
  playerA: Player
  playerB: Player
}

export function MatchCard({ match, playerA, playerB }: MatchCardProps) {
  const { setMatchScore } = useTournament()
  const [editing, setEditing] = useState(false)
  const played = match.scoreA !== null && match.scoreB !== null

  const handleSave = (scoreA: number, scoreB: number) => {
    setMatchScore(match.id, scoreA, scoreB)
    setEditing(false)
  }

  const isKnockout = !!match.stage
  return (
    <div
      className={`rounded-lg border p-4 ${
        match.isGoldenGoal
          ? 'border-amber-500/50 bg-amber-950/20'
          : isKnockout
            ? 'border-violet-500/50 bg-violet-950/20'
            : 'border-slate-600 bg-slate-800/50'
      }`}
    >
      {match.isGoldenGoal && (
        <div className="mb-2 text-xs font-medium uppercase tracking-wide text-amber-400">
          Golden goal playoff
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium text-slate-100">{playerA.name}</span>
        <span className="text-slate-500">vs</span>
        <span className="font-medium text-slate-100">{playerB.name}</span>
      </div>
      {played && !editing ? (
        <div className="mt-2 flex items-center gap-2">
          <span className="text-2xl font-bold text-slate-100">
            {match.scoreA} – {match.scoreB}
          </span>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-sm text-slate-400 hover:text-emerald-400"
          >
            Edit score
          </button>
        </div>
      ) : (
        <ScoreInput
          onSave={handleSave}
          onCancel={editing ? () => setEditing(false) : undefined}
          isGoldenGoal={match.isGoldenGoal}
          initialA={match.scoreA}
          initialB={match.scoreB}
        />
      )}
    </div>
  )
}
