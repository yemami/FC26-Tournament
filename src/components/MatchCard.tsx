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
  const { setMatchScore, setMatchComment, getMatchPrediction } = useTournament()
  const [editing, setEditing] = useState(false)
  const [commentInput, setCommentInput] = useState(match.comment ?? '')
  const [showCommentInput, setShowCommentInput] = useState(false)
  const played = match.scoreA !== null && match.scoreB !== null
  const prediction = !played ? getMatchPrediction(playerA.name, playerB.name) : null

  const handleSave = (scoreA: number, scoreB: number) => {
    setMatchScore(match.id, scoreA, scoreB)
    setEditing(false)
  }

  const isKnockout = !!match.stage
  return (
    <div
      className={`rounded-card border p-4 transition-all ${
        match.isGoldenGoal
          ? 'border-amber-300 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/20'
          : isKnockout
            ? 'border-neobank-lime/30 dark:border-neobank-lime/50 bg-neobank-lime/5 dark:bg-neobank-lime/10'
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
      } shadow-card dark:shadow-none dark:border hover:shadow-card-hover`}
    >
      {match.isGoldenGoal && (
        <div className="mb-3 px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 inline-block">
          <span className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
            Golden goal playoff
          </span>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="font-semibold text-gray-900 dark:text-gray-100">{playerA.name}</span>
        <span className="text-gray-400 dark:text-gray-500 font-medium">vs</span>
        <span className="font-semibold text-gray-900 dark:text-gray-100">{playerB.name}</span>
      </div>
      {!played && (
        <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          {prediction ? (
            <>
              <span className="text-gray-600 dark:text-gray-400">
                <span className="font-medium text-neobank-lime">{prediction.playerAWinPct}%</span> {playerA.name}
              </span>
              <span className="text-gray-500 dark:text-gray-500">
                {prediction.drawPct}% draw
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                {playerB.name} <span className="font-medium text-neobank-lime">{prediction.playerBWinPct}%</span>
              </span>
              <span className="text-gray-400 dark:text-gray-500 italic">
                (based on {prediction.totalMatches} previous match{prediction.totalMatches !== 1 ? 'es' : ''})
              </span>
            </>
          ) : (
            <span className="text-gray-400 dark:text-gray-500 italic">
              No head-to-head history — first meeting
            </span>
          )}
        </div>
      )}
      {played && !editing ? (
        <div>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {match.scoreA} – {match.scoreB}
            </span>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-sm font-medium text-neobank-lime hover:text-neobank-lime-dark transition-colors"
            >
              Edit
            </button>
          </div>
          {match.comment ? (
            <div className="mt-2 flex items-start gap-2">
              <p className="text-sm text-gray-600 dark:text-gray-400 italic flex-1">&quot;{match.comment}&quot;</p>
              <button
                type="button"
                onClick={() => {
                  setCommentInput(match.comment ?? '')
                  setShowCommentInput(true)
                }}
                className="text-xs text-neobank-lime hover:text-neobank-lime-dark shrink-0"
              >
                Edit
              </button>
            </div>
          ) : showCommentInput ? (
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Add a comment (optional)..."
                className="flex-1 rounded-button border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setMatchComment(match.id, commentInput)
                    setShowCommentInput(false)
                  }
                  if (e.key === 'Escape') setShowCommentInput(false)
                }}
              />
              <button
                type="button"
                onClick={() => {
                  setMatchComment(match.id, commentInput)
                  setShowCommentInput(false)
                }}
                className="text-sm font-medium text-neobank-lime hover:text-neobank-lime-dark"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setCommentInput('')
                  setShowCommentInput(false)
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowCommentInput(true)}
              className="mt-3 flex items-center gap-1.5 rounded-button border border-dashed border-gray-400 dark:border-gray-500 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:border-neobank-lime hover:text-neobank-lime hover:bg-neobank-lime/5 dark:hover:bg-neobank-lime/10 transition-colors"
            >
              <span className="text-base leading-none">+</span>
              Add comment
            </button>
          )}
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
