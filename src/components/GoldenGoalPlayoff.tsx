import { useEffect } from 'react'
import { useTournament } from '../context/TournamentContext'
import { MatchCard } from './MatchCard'

export function GoldenGoalPlayoff() {
  const { matches, standings, players, addGoldenGoalMatchesForTies } = useTournament()
  const goldenMatches = matches.filter((m) => m.isGoldenGoal)
  const playerMap = new Map(players.map((p) => [p.id, p]))

  const roundRobinMatches = matches.filter((m) => !m.isGoldenGoal && m.roundIndex >= 0)
  const allRoundRobinPlayed = roundRobinMatches.length > 0 && roundRobinMatches.every((m) => m.scoreA !== null && m.scoreB !== null)

  useEffect(() => {
    const hasTies = standings.some((s) => s.isTied)
    if (hasTies && allRoundRobinPlayed) addGoldenGoalMatchesForTies()
  }, [standings, allRoundRobinPlayed, addGoldenGoalMatchesForTies])

  if (goldenMatches.length === 0 && !standings.some((s) => s.isTied)) return null

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-amber-400">Golden goal playoffs</h2>
      <p className="text-sm text-slate-400">
        Tied on points and goals. First to score wins.
      </p>
      {goldenMatches.length === 0 && standings.some((s) => s.isTied) && (
        <p className="text-sm text-slate-400">Add golden goal matches will appear here once round-robin is complete.</p>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {goldenMatches.map((m) => {
          const pa = playerMap.get(m.playerAId)
          const pb = playerMap.get(m.playerBId)
          if (!pa || !pb) return null
          return <MatchCard key={m.id} match={m} playerA={pa} playerB={pb} />
        })}
      </div>
    </div>
  )
}
