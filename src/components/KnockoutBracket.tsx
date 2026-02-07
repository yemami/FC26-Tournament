import { useTournament } from '../context/TournamentContext'
import { MatchCard } from './MatchCard'

const STAGE_LABELS: Record<string, string> = {
  play_in: 'Play-in (4th vs 5th)',
  semi: 'Semi-final',
  final: 'Final',
  third_place: '3rd place',
}

export function KnockoutBracket() {
  const { matches, players, knockoutSeeds } = useTournament()
  const playerMap = new Map(players.map((p) => [p.id, p]))
  const knockoutMatches = matches.filter((m) => m.stage).sort((a, b) => a.roundIndex - b.roundIndex || a.id.localeCompare(b.id))

  if (!knockoutSeeds?.length) return null
  if (knockoutMatches.length === 0) return null

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-200">Knockout stage</h2>
      <p className="text-sm text-slate-400">Top 5 from group stage (random draw). Semi-finals → Final & 3rd place.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {knockoutMatches.map((m) => {
          const pa = playerMap.get(m.playerAId)
          const pb = playerMap.get(m.playerBId)
          if (!pa || !pb) return null
          const label = m.stage ? STAGE_LABELS[m.stage] ?? m.stage : ''
          return (
            <div key={m.id}>
              {label && (
                <div className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                  {label}
                  {m.stage === 'semi' && (m.id === 'ko-semi1' ? ' 1' : ' 2')}
                </div>
              )}
              <MatchCard match={m} playerA={pa} playerB={pb} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
