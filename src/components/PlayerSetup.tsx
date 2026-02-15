import { useTournament } from '../context/TournamentContext'
import { getUniquePlayerNames } from '../lib/headToHead'

export function PlayerSetup() {
  const { players, availablePlayers, selectPlayer, removePlayer, shufflePlayers, loadSamplePlayers, startTournament } = useTournament()

  const uniqueByName = getUniquePlayerNames(availablePlayers)
  const selectedIds = new Set(players.map((p) => p.id))
  const selectablePlayers = uniqueByName.map(({ name }) =>
    availablePlayers.find((p) => p.name.trim().toLowerCase() === name.toLowerCase())
  ).filter((p): p is NonNullable<typeof p> => !!p)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-card shadow-card dark:shadow-none dark:border dark:border-gray-700 p-6 space-y-6 transition-colors">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value=""
          onChange={(e) => {
            const id = e.target.value
            if (id) selectPlayer(id)
            e.target.value = ''
          }}
          className="rounded-button border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-gray-100 focus:border-neobank-lime focus:outline-none transition-colors min-w-[180px]"
        >
          <option value="">Select player to add</option>
          {selectablePlayers
            .filter((p) => !selectedIds.has(p.id))
            .map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
        </select>
        <button
          type="button"
          onClick={loadSamplePlayers}
          className="rounded-button bg-gray-100 dark:bg-gray-700 px-4 py-2.5 font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Load sample players
        </button>
      </div>

      {players.length > 0 && (
        <>
          <div>
            <h2 className="mb-3 text-lg font-bold text-gray-900 dark:text-gray-100">Players ({players.length})</h2>
            <ul className="flex flex-wrap gap-2">
              {players.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center gap-2 rounded-full bg-gray-100 dark:bg-gray-700 px-4 py-2 text-sm font-medium border border-gray-200 dark:border-gray-600 transition-colors"
                >
                  <span className="text-gray-900 dark:text-gray-100">{p.name}</span>
                  <button
                    type="button"
                    onClick={() => removePlayer(p.id)}
                    className="ml-1 w-5 h-5 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    aria-label={`Remove ${p.name}`}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={shufflePlayers}
              className="rounded-button bg-gray-100 dark:bg-gray-700 px-5 py-2.5 font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Shuffle players
            </button>
            <button
              type="button"
              onClick={startTournament}
              disabled={players.length < 2}
              className="flex-1 rounded-button bg-black dark:bg-gray-700 px-6 py-2.5 font-semibold text-white hover:bg-gray-800 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              Start tournament
            </button>
          </div>
        </>
      )}

      {players.length < 2 && players.length > 0 && (
        <div className="rounded-card bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4">
          <p className="text-amber-700 dark:text-amber-300 font-medium">Select at least 2 players to start the tournament.</p>
        </div>
      )}
      {availablePlayers.length === 0 && players.length === 0 && (
        <div className="rounded-card bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4">
          <p className="text-amber-700 dark:text-amber-300 font-medium">No players yet. Click &quot;Load sample players&quot; to add your friends.</p>
        </div>
      )}
    </div>
  )
}
