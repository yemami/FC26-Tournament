import { useTournament } from '../context/TournamentContext'
import { MatchCard } from './MatchCard'

export function RoundList() {
  const { matches, players } = useTournament()
  const playerMap = new Map(players.map((p) => [p.id, p]))

  const roundRobinMatches = matches.filter((m) => !m.isGoldenGoal && m.roundIndex >= 0)
  const rounds = new Map<number, typeof roundRobinMatches>()
  for (const m of roundRobinMatches) {
    if (!rounds.has(m.roundIndex)) rounds.set(m.roundIndex, [])
    rounds.get(m.roundIndex)!.push(m)
  }
  const roundIndices = Array.from(rounds.keys()).sort((a, b) => a - b)

  if (roundIndices.length === 0) return null

  return (
    <div className="space-y-6">
      {roundIndices.map((r) => (
        <div key={r}>
          <h3 className="mb-2 text-sm font-medium text-slate-400">Round {r + 1}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {rounds.get(r)!.map((m) => {
              const pa = playerMap.get(m.playerAId)
              const pb = playerMap.get(m.playerBId)
              if (!pa || !pb) return null
              return <MatchCard key={m.id} match={m} playerA={pa} playerB={pb} />
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
