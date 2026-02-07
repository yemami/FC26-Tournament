import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Match, Player, KnockoutResults } from '../types'
import { generateRoundRobinSchedule } from '../lib/roundRobin'
import { computeStandings } from '../lib/standings'
import { getTiedPairs } from '../lib/tieBreak'

const STORAGE_KEY = 'fc26-tournament'

interface TournamentState {
  players: Player[]
  matches: Match[]
  /** Top 5 player ids (shuffled) when knockout stage has started */
  knockoutSeeds: string[] | null
}

function loadState(): TournamentState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { players: [], matches: [], knockoutSeeds: null }
    const data = JSON.parse(raw) as TournamentState
    return {
      players: Array.isArray(data.players) ? data.players : [],
      matches: Array.isArray(data.matches) ? data.matches : [],
      knockoutSeeds: Array.isArray(data.knockoutSeeds) && data.knockoutSeeds.length === 5 ? data.knockoutSeeds : null,
    }
  } catch {
    return { players: [], matches: [], knockoutSeeds: null }
  }
}

function saveState(state: TournamentState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (_) {}
}

const SAMPLE_PLAYER_NAMES = ['abel', 'sime', 'teda', 'gedi', 'alazar', 'beki', 'haftish', 'minalu']

type TournamentContextValue = {
  players: Player[]
  matches: Match[]
  addPlayer: (name: string) => void
  removePlayer: (id: string) => void
  shufflePlayers: () => void
  loadSamplePlayers: () => void
  startTournament: () => void
  setMatchScore: (matchId: string, scoreA: number, scoreB: number) => void
  resetTournament: () => void
  startKnockoutStage: () => void
  fillFirstRoundWithSampleScores: () => void
  fillAllRoundsTillSeven: () => void
  standings: ReturnType<typeof computeStandings>
  knockoutResults: KnockoutResults | null
  addGoldenGoalMatchesForTies: () => void
}

const TournamentContext = createContext<TournamentContextValue | null>(null)

function makeId() {
  return Math.random().toString(36).slice(2, 11)
}

export function TournamentProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TournamentState>(loadState)

  useEffect(() => {
    saveState(state)
  }, [state])

  const addPlayer = useCallback((name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    setState((s) => ({
      ...s,
      players: [...s.players, { id: makeId(), name: trimmed }],
    }))
  }, [])

  const removePlayer = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      players: s.players.filter((p) => p.id !== id),
      matches: [],
      knockoutSeeds: null,
    }))
  }, [])

  const shufflePlayers = useCallback(() => {
    setState((s) => {
      const list = [...s.players]
      for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[list[i], list[j]] = [list[j], list[i]]
      }
      return { ...s, players: list }
    })
  }, [])

  const loadSamplePlayers = useCallback(() => {
    setState((s) => ({
      ...s,
      players: SAMPLE_PLAYER_NAMES.map((name) => ({ id: makeId(), name })),
      matches: [],
    }))
  }, [])

  const startTournament = useCallback(() => {
    setState((s) => {
      if (s.players.length < 2) return s
      const schedule = generateRoundRobinSchedule(s.players)
      const matches: Match[] = schedule.map((m, i) => ({
        id: `m-${i}-${m.playerAId}-${m.playerBId}`,
        playerAId: m.playerAId,
        playerBId: m.playerBId,
        roundIndex: m.roundIndex,
        scoreA: null,
        scoreB: null,
        status: 'pending',
      }))
      return { ...s, matches, knockoutSeeds: null }
    })
  }, [])

  const setMatchScore = useCallback((matchId: string, scoreA: number, scoreB: number) => {
    setState((s) => {
      const match = s.matches.find((m) => m.id === matchId)
      if (!match) return s
      if (match.isGoldenGoal) {
        if (scoreA + scoreB !== 1 || (scoreA !== 0 && scoreA !== 1)) return s
        const sa = scoreA >= 1 ? 1 : 0
        const sb = scoreB >= 1 ? 1 : 0
        return {
          ...s,
          matches: s.matches.map((m) =>
            m.id === matchId ? { ...m, scoreA: sa, scoreB: sb, status: 'golden_goal' as const } : m
          ),
        }
      }
      let next = {
        ...s,
        matches: s.matches.map((m) =>
          m.id === matchId ? { ...m, scoreA, scoreB, status: 'played' as const } : m
        ),
      }
      // Knockout: create next round matches when current round is completed
      if (match.stage === 'play_in' && s.knockoutSeeds?.length === 5) {
        const hasSemi = next.matches.some((m) => m.stage === 'semi')
        if (!hasSemi) {
          const winner = scoreA > scoreB ? match.playerAId : match.playerBId
          const [s0, s1, s2] = s.knockoutSeeds
          next = {
            ...next,
            matches: [
              ...next.matches,
              { id: 'ko-semi1', playerAId: s0, playerBId: winner, roundIndex: -10, scoreA: null, scoreB: null, status: 'pending' as const, stage: 'semi' as const },
              { id: 'ko-semi2', playerAId: s1, playerBId: s2, roundIndex: -10, scoreA: null, scoreB: null, status: 'pending' as const, stage: 'semi' as const },
            ],
          }
        }
      }
      if (match.stage === 'semi' && s.knockoutSeeds) {
        const semis = next.matches.filter((m) => m.stage === 'semi')
        const bothPlayed = semis.every((m) => m.scoreA !== null && m.scoreB !== null)
        const hasFinal = next.matches.some((m) => m.stage === 'final')
        if (bothPlayed && !hasFinal) {
          const winner1 = (semis[0]!.scoreA! > semis[0]!.scoreB!) ? semis[0]!.playerAId : semis[0]!.playerBId
          const loser1 = (semis[0]!.scoreA! > semis[0]!.scoreB!) ? semis[0]!.playerBId : semis[0]!.playerAId
          const winner2 = (semis[1]!.scoreA! > semis[1]!.scoreB!) ? semis[1]!.playerAId : semis[1]!.playerBId
          const loser2 = (semis[1]!.scoreA! > semis[1]!.scoreB!) ? semis[1]!.playerBId : semis[1]!.playerAId
          next = {
            ...next,
            matches: [
              ...next.matches,
              { id: 'ko-final', playerAId: winner1, playerBId: winner2, roundIndex: -11, scoreA: null, scoreB: null, status: 'pending' as const, stage: 'final' as const },
              { id: 'ko-third', playerAId: loser1, playerBId: loser2, roundIndex: -11, scoreA: null, scoreB: null, status: 'pending' as const, stage: 'third_place' as const },
            ],
          }
        }
      }
      return next
    })
  }, [])

  const resetTournament = useCallback(() => {
    setState((s) => ({ ...s, matches: [], knockoutSeeds: null }))
  }, [])

  const startKnockoutStage = useCallback(() => {
    setState((s) => {
      const groupStandings = computeStandings(s.players, s.matches.filter((m) => !m.stage))
      const top5 = groupStandings.slice(0, 5).map((r) => r.playerId)
      if (top5.length < 5) return s
      const seeds = [...top5]
      for (let i = seeds.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[seeds[i], seeds[j]] = [seeds[j], seeds[i]]
      }
      const playInA = seeds[3]
      const playInB = seeds[4]
      const playInMatch: Match = {
        id: 'ko-playin',
        playerAId: playInA,
        playerBId: playInB,
        roundIndex: -10,
        scoreA: null,
        scoreB: null,
        status: 'pending',
        stage: 'play_in',
      }
      return {
        ...s,
        knockoutSeeds: seeds,
        matches: [...s.matches, playInMatch],
      }
    })
  }, [])

  // Sample scores for testing. Cycle through for many matches.
  const SAMPLE_SCORES: [number, number][] = [
    [2, 1], [0, 0], [3, 1], [1, 2], [2, 2], [1, 0], [3, 0], [0, 1], [2, 0], [1, 3], [0, 2], [1, 1], [3, 2], [2, 3],
  ]

  const fillFirstRoundWithSampleScores = useCallback(() => {
    setState((s) => {
      const firstRoundMatches = s.matches
        .filter((m) => !m.isGoldenGoal && m.roundIndex === 0)
        .sort((a, b) => a.id.localeCompare(b.id))
      if (firstRoundMatches.length === 0) return s
      return {
        ...s,
        matches: s.matches.map((m) => {
          if (m.isGoldenGoal || m.roundIndex !== 0) return m
          const idx = firstRoundMatches.findIndex((r) => r.id === m.id)
          const [scoreA, scoreB] = SAMPLE_SCORES[idx % SAMPLE_SCORES.length] ?? [0, 0]
          return { ...m, scoreA, scoreB, status: 'played' as const }
        }),
      }
    })
  }, [])

  const fillAllRoundsTillSeven = useCallback(() => {
    setState((s) => {
      const roundRobin = s.matches
        .filter((m) => !m.isGoldenGoal && m.roundIndex >= 0 && m.roundIndex <= 6)
        .sort((a, b) => a.roundIndex - b.roundIndex || a.id.localeCompare(b.id))
      if (roundRobin.length === 0) return s
      return {
        ...s,
        matches: s.matches.map((m) => {
          if (m.isGoldenGoal || m.roundIndex < 0 || m.roundIndex > 6) return m
          const idx = roundRobin.findIndex((r) => r.id === m.id)
          const [scoreA, scoreB] = SAMPLE_SCORES[idx % SAMPLE_SCORES.length] ?? [0, 0]
          return { ...m, scoreA, scoreB, status: 'played' as const }
        }),
      }
    })
  }, [])

  const standings = useMemo(
    () => computeStandings(state.players, state.matches),
    [state.players, state.matches]
  )

  const knockoutResults = useMemo((): KnockoutResults | null => {
    const finalMatch = state.matches.find((m) => m.stage === 'final')
    const thirdMatch = state.matches.find((m) => m.stage === 'third_place')
    if (!finalMatch || !thirdMatch || finalMatch.scoreA === null || finalMatch.scoreB === null || thirdMatch.scoreA === null || thirdMatch.scoreB === null) return null
    const firstId = finalMatch.scoreA > finalMatch.scoreB ? finalMatch.playerAId : finalMatch.playerBId
    const secondId = finalMatch.scoreA > finalMatch.scoreB ? finalMatch.playerBId : finalMatch.playerAId
    const thirdId = thirdMatch.scoreA > thirdMatch.scoreB ? thirdMatch.playerAId : thirdMatch.playerBId
    return { firstId, secondId, thirdId }
  }, [state.matches])

  const addGoldenGoalMatchesForTies = useCallback(() => {
    const tiedPairs = getTiedPairs(standings)
    if (tiedPairs.length === 0) return
    const existingPairs = new Set(
      state.matches
        .filter((m) => m.isGoldenGoal)
        .map((m) => [m.playerAId, m.playerBId].sort().join('-'))
    )
    const toAdd: Match[] = []
    for (const [playerAId, playerBId] of tiedPairs) {
      const key = [playerAId, playerBId].sort().join('-')
      if (existingPairs.has(key)) continue
      existingPairs.add(key)
      toAdd.push({
        id: `golden-${key}`,
        playerAId,
        playerBId,
        roundIndex: -1,
        scoreA: null,
        scoreB: null,
        status: 'golden_goal',
        isGoldenGoal: true,
      })
    }
    if (toAdd.length > 0) {
      setState((s) => ({ ...s, matches: [...s.matches, ...toAdd] }))
    }
  }, [standings, state.matches])

  const value = useMemo<TournamentContextValue>(
    () => ({
      players: state.players,
      matches: state.matches,
      addPlayer,
      removePlayer,
      shufflePlayers,
      loadSamplePlayers,
      startTournament,
      setMatchScore,
      resetTournament,
      startKnockoutStage,
      fillFirstRoundWithSampleScores,
      fillAllRoundsTillSeven,
      standings,
      knockoutResults,
      addGoldenGoalMatchesForTies,
    }),
    [
      state.players,
      state.matches,
      addPlayer,
      removePlayer,
      shufflePlayers,
      loadSamplePlayers,
      startTournament,
      setMatchScore,
      resetTournament,
      startKnockoutStage,
      fillFirstRoundWithSampleScores,
      fillAllRoundsTillSeven,
      standings,
      knockoutResults,
      addGoldenGoalMatchesForTies,
    ]
  )

  return (
    <TournamentContext.Provider value={value}>
      {children}
    </TournamentContext.Provider>
  )
}

export function useTournament() {
  const ctx = useContext(TournamentContext)
  if (!ctx) throw new Error('useTournament must be used within TournamentProvider')
  return ctx
}
