import { useState } from 'react'
import { useTournament } from '../context/TournamentContext'

export function PlayerSetup() {
  const { players, addPlayer, removePlayer, shufflePlayers, loadSamplePlayers, startTournament } = useTournament()
  const [name, setName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addPlayer(name)
    setName('')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={loadSamplePlayers}
          className="rounded bg-amber-600 px-4 py-2 font-medium text-white hover:bg-amber-500"
        >
          Load sample players
        </button>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Player name"
          className="rounded border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
        <button
          type="submit"
          className="rounded bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-500"
        >
          Add player
        </button>
      </form>

      {players.length > 0 && (
        <>
          <div>
            <h2 className="mb-2 text-lg font-semibold text-slate-200">Players ({players.length})</h2>
            <ul className="flex flex-wrap gap-2">
              {players.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center gap-1 rounded-full bg-slate-700 px-3 py-1 text-sm"
                >
                  <span>{p.name}</span>
                  <button
                    type="button"
                    onClick={() => removePlayer(p.id)}
                    className="ml-1 rounded-full text-slate-400 hover:bg-slate-600 hover:text-red-400"
                    aria-label={`Remove ${p.name}`}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={shufflePlayers}
              className="rounded bg-slate-600 px-4 py-2 font-medium text-slate-100 hover:bg-slate-500"
            >
              Shuffle players
            </button>
            <button
              type="button"
              onClick={startTournament}
              disabled={players.length < 2}
              className="rounded bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600"
            >
              Start tournament
            </button>
          </div>
        </>
      )}

      {players.length < 2 && players.length > 0 && (
        <p className="text-amber-400">Add at least 2 players to start the tournament.</p>
      )}
    </div>
  )
}
