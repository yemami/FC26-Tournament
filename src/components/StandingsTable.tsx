import { useTournament } from '../context/TournamentContext'

export function StandingsTable() {
  const { standings } = useTournament()

  if (standings.length === 0) return null

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-600">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-slate-800 text-slate-300">
          <tr>
            <th className="px-3 py-2 font-medium">#</th>
            <th className="px-3 py-2 font-medium">Player</th>
            <th className="px-3 py-2 font-medium">P</th>
            <th className="px-3 py-2 font-medium">W</th>
            <th className="px-3 py-2 font-medium">D</th>
            <th className="px-3 py-2 font-medium">L</th>
            <th className="px-3 py-2 font-medium">GF</th>
            <th className="px-3 py-2 font-medium">GA</th>
            <th className="px-3 py-2 font-medium">GD</th>
            <th className="px-3 py-2 font-medium">Pts</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700">
          {standings.map((row) => (
            <tr
              key={row.playerId}
              className={`${
                row.isTied ? 'bg-amber-950/30' : ''
              } hover:bg-slate-800/50`}
            >
              <td className="px-3 py-2 font-medium">{row.rank}</td>
              <td className="px-3 py-2">
                <span className="text-slate-100">{row.playerName}</span>
                {row.isTied && (
                  <span className="ml-1 text-xs text-amber-400">(tied)</span>
                )}
              </td>
              <td className="px-3 py-2 text-slate-300">{row.played}</td>
              <td className="px-3 py-2 text-slate-300">{row.wins}</td>
              <td className="px-3 py-2 text-slate-300">{row.draws}</td>
              <td className="px-3 py-2 text-slate-300">{row.losses}</td>
              <td className="px-3 py-2 text-slate-300">{row.goalsFor}</td>
              <td className="px-3 py-2 text-slate-300">{row.goalsAgainst}</td>
              <td className="px-3 py-2 text-slate-300">
                {row.goalDifference >= 0 ? '+' : ''}{row.goalDifference}
              </td>
              <td className="px-3 py-2 font-semibold text-slate-100">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
