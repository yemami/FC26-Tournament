import { useState } from 'react'
import { TournamentProvider, useTournament } from './context/TournamentContext'
import { PlayerSetup } from './components/PlayerSetup'
import { RoundList } from './components/RoundList'
import { StandingsTable } from './components/StandingsTable'
import { GoldenGoalPlayoff } from './components/GoldenGoalPlayoff'
import { KnockoutBracket } from './components/KnockoutBracket'
import { Podium } from './components/Podium'

function AppContent() {
  const { matches, resetTournament } = useTournament()
  const [showKey, setShowKey] = useState(false)
  const inTournament = matches.length > 0

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <header className="border-b border-slate-700 bg-slate-800 px-4 py-3">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold">Round Robin Tournament</h1>
            <button
              type="button"
              onClick={() => setShowKey((v) => !v)}
              className="rounded bg-slate-600 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-500"
              aria-expanded={showKey}
            >
              Key
            </button>
            {inTournament && (
              <button
                type="button"
                onClick={resetTournament}
                className="rounded bg-slate-600 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-500"
              >
                Reset tournament
              </button>
            )}
          </div>
          {showKey && (
            <p className="mt-2 text-xs text-slate-400">
              <span className="text-slate-300">#</span> Rank · <span className="text-slate-300">P</span> Played · <span className="text-slate-300">W</span> Wins · <span className="text-slate-300">D</span> Draws · <span className="text-slate-300">L</span> Losses · <span className="text-slate-300">GF</span> Goals For · <span className="text-slate-300">GA</span> Goals Against · <span className="text-slate-300">GD</span> Goal Difference · <span className="text-slate-300">Pts</span> Points
            </p>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-4xl p-4">
        {inTournament ? (
          <TournamentView />
        ) : (
          <SetupView />
        )}
      </main>
    </div>
  )
}

function SetupView() {
  return (
    <section className="space-y-6">
      <p className="text-slate-300">Add players, shuffle if you like, then start the tournament.</p>
      <PlayerSetup />
    </section>
  )
}

function TournamentView() {
  const {
    fillFirstRoundWithSampleScores,
    fillAllRoundsTillSeven,
    startKnockoutStage,
    standings,
    matches,
    knockoutSeeds,
  } = useTournament()

  const groupMatches = matches.filter((m) => !m.stage && !m.isGoldenGoal && m.roundIndex >= 0)
  const allGroupPlayed = groupMatches.length > 0 && groupMatches.every((m) => m.scoreA !== null && m.scoreB !== null)
  const goldenMatches = matches.filter((m) => m.isGoldenGoal)
  const allGoldenPlayed = goldenMatches.length === 0 || goldenMatches.every((m) => m.scoreA !== null && m.scoreB !== null)
  const canStartKnockout = !knockoutSeeds && allGroupPlayed && allGoldenPlayed && !standings.some((s) => s.isTied) && standings.length >= 5

  return (
    <section className="space-y-8">
      <Podium />
      <div>
        <h2 className="mb-3 text-xl font-semibold text-slate-200">Group stage standings</h2>
        <StandingsTable />
      </div>
      {canStartKnockout && (
        <div>
          <button
            type="button"
            onClick={startKnockoutStage}
            className="rounded bg-violet-600 px-4 py-2 font-medium text-white hover:bg-violet-500"
          >
            Start knockout stage (top 5, random draw)
          </button>
          <p className="mt-1 text-sm text-slate-400">Semi-finals, final and 3rd place match. Rank 1–3 from knockout.</p>
        </div>
      )}
      <KnockoutBracket />
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-xl font-semibold text-slate-200">Group rounds</h2>
        <button
          type="button"
          onClick={fillFirstRoundWithSampleScores}
          className="rounded bg-amber-600 px-3 py-1.5 text-sm text-white hover:bg-amber-500"
        >
          Fill first round (test)
        </button>
        <button
          type="button"
          onClick={fillAllRoundsTillSeven}
          className="rounded bg-amber-600 px-3 py-1.5 text-sm text-white hover:bg-amber-500"
        >
          Fill rounds 1–7 (test)
        </button>
      </div>
      <RoundList />
      <GoldenGoalPlayoff />
    </section>
  )
}

export default function App() {
  return (
    <TournamentProvider>
      <AppContent />
    </TournamentProvider>
  )
}
