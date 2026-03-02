import type { Match, Player } from '../types'

export interface HeadToHeadStats {
  playerAId: string
  playerBId: string
  playerAName: string
  playerBName: string
  totalMatches: number
  playerAWins: number
  playerBWins: number
  draws: number
  playerAGoals: number
  playerBGoals: number
  matches: Array<{
    match: Match
    playerA: Player
    playerB: Player
    scoreForPlayerA: number
    scoreForPlayerB: number
    matchType: 'group' | 'knockout' | 'golden_goal'
    stage?: string
    roundIndex: number
  }>
}

export interface MatchTypeStats {
  group: {
    matches: number
    playerAWins: number
    playerBWins: number
    draws: number
    playerAGoals: number
    playerBGoals: number
  }
  knockout: {
    matches: number
    playerAWins: number
    playerBWins: number
    draws: number
    playerAGoals: number
    playerBGoals: number
    stages: Record<string, number> // stage -> count
  }
  golden_goal: {
    matches: number
    playerAWins: number
    playerBWins: number
    draws: number
    playerAGoals: number
    playerBGoals: number
  }
}

/**
 * Calculate head-to-head statistics between two players
 */
export function calculateHeadToHead(
  playerAId: string,
  playerBId: string,
  matches: Match[],
  players: Player[]
): HeadToHeadStats | null {
  const playerA = players.find((p) => p.id === playerAId)
  const playerB = players.find((p) => p.id === playerBId)

  if (!playerA || !playerB) return null

  // Filter matches between these two players (in either direction)
  const relevantMatches = matches.filter((m) => {
    const isPlayerA = m.playerAId === playerAId || m.playerBId === playerAId
    const isPlayerB = m.playerAId === playerBId || m.playerBId === playerBId
    return isPlayerA && isPlayerB && m.scoreA !== null && m.scoreB !== null
  })

  let playerAWins = 0
  let playerBWins = 0
  let draws = 0
  let playerAGoals = 0
  let playerBGoals = 0

  const matchDetails = relevantMatches.map((match) => {
    // Determine which player is A and which is B in this match
    const isPlayerAFirst = match.playerAId === playerAId
    const scoreA = isPlayerAFirst ? match.scoreA! : match.scoreB!
    const scoreB = isPlayerAFirst ? match.scoreB! : match.scoreA!

    playerAGoals += scoreA
    playerBGoals += scoreB

    if (scoreA > scoreB) {
      playerAWins++
    } else if (scoreB > scoreA) {
      playerBWins++
    } else {
      draws++
    }

    // Determine match type
    let matchType: 'group' | 'knockout' | 'golden_goal'
    if (match.isGoldenGoal) {
      matchType = 'golden_goal'
    } else if (match.stage) {
      matchType = 'knockout'
    } else {
      matchType = 'group'
    }

    // Get the actual player objects for this match
    const matchPlayerA = players.find((p) => p.id === match.playerAId)!
    const matchPlayerB = players.find((p) => p.id === match.playerBId)!

    return {
      match,
      playerA: matchPlayerA,
      playerB: matchPlayerB,
      scoreForPlayerA: scoreA,
      scoreForPlayerB: scoreB,
      matchType,
      stage: match.stage,
      roundIndex: match.roundIndex,
    }
  })

  return {
    playerAId,
    playerBId,
    playerAName: playerA.name,
    playerBName: playerB.name,
    totalMatches: relevantMatches.length,
    playerAWins,
    playerBWins,
    draws,
    playerAGoals,
    playerBGoals,
    matches: matchDetails,
  }
}

/**
 * Count unique name pairs that have played matches (for display).
 */
export function getPlayedPairsCountByName(matches: Match[], players: Player[]): number {
  const pairs = new Set<string>()
  for (const m of matches) {
    if (m.scoreA === null || m.scoreB === null) continue
    const pA = players.find((p) => p.id === m.playerAId)
    const pB = players.find((p) => p.id === m.playerBId)
    if (!pA || !pB) continue
    const key = [pA.name.trim().toLowerCase(), pB.name.trim().toLowerCase()].sort().join('|')
    pairs.add(key)
  }
  return pairs.size
}

/**
 * Get unique player names (deduplicated) for dropdowns.
 * When multiple player records exist for the same person, show name once.
 */
export function getUniquePlayerNames(players: Player[]): Array<{ name: string; normalized: string }> {
  const seen = new Set<string>()
  return players
    .filter((p) => {
      const n = p.name.trim().toLowerCase()
      if (seen.has(n)) return false
      seen.add(n)
      return true
    })
    .map((p) => ({ name: p.name.trim(), normalized: p.name.trim().toLowerCase() }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Calculate head-to-head by name, aggregating across duplicate player IDs.
 * Use when the same person has multiple player records (e.g. "Abel" added 5 times).
 */
export function calculateHeadToHeadByName(
  playerAName: string,
  playerBName: string,
  matches: Match[],
  players: Player[]
): HeadToHeadStats | null {
  const aNorm = playerAName.trim().toLowerCase()
  const bNorm = playerBName.trim().toLowerCase()
  const playerAIds = new Set(players.filter((p) => p.name.trim().toLowerCase() === aNorm).map((p) => p.id))
  const playerBIds = new Set(players.filter((p) => p.name.trim().toLowerCase() === bNorm).map((p) => p.id))

  if (playerAIds.size === 0 || playerBIds.size === 0) return null

  const relevantMatches = matches.filter((m) => {
    const aInMatch = playerAIds.has(m.playerAId) || playerAIds.has(m.playerBId)
    const bInMatch = playerBIds.has(m.playerAId) || playerBIds.has(m.playerBId)
    return aInMatch && bInMatch && m.scoreA !== null && m.scoreB !== null
  })

  let playerAWins = 0
  let playerBWins = 0
  let draws = 0
  let playerAGoals = 0
  let playerBGoals = 0

  const matchDetails = relevantMatches.map((match) => {
    const isPlayerAFirst = playerAIds.has(match.playerAId)
    const scoreA = isPlayerAFirst ? match.scoreA! : match.scoreB!
    const scoreB = isPlayerAFirst ? match.scoreB! : match.scoreA!

    playerAGoals += scoreA
    playerBGoals += scoreB

    if (scoreA > scoreB) playerAWins++
    else if (scoreB > scoreA) playerBWins++
    else draws++

    let matchType: 'group' | 'knockout' | 'golden_goal'
    if (match.isGoldenGoal) matchType = 'golden_goal'
    else if (match.stage) matchType = 'knockout'
    else matchType = 'group'

    const matchPlayerA = players.find((p) => p.id === match.playerAId)!
    const matchPlayerB = players.find((p) => p.id === match.playerBId)!

    return {
      match,
      playerA: matchPlayerA,
      playerB: matchPlayerB,
      scoreForPlayerA: scoreA,
      scoreForPlayerB: scoreB,
      matchType,
      stage: match.stage,
      roundIndex: match.roundIndex,
    }
  })

  return {
    playerAId: Array.from(playerAIds)[0] ?? '',
    playerBId: Array.from(playerBIds)[0] ?? '',
    playerAName: playerAName.trim(),
    playerBName: playerBName.trim(),
    totalMatches: relevantMatches.length,
    playerAWins,
    playerBWins,
    draws,
    playerAGoals,
    playerBGoals,
    matches: matchDetails,
  }
}

/**
 * Get match type statistics breakdown
 */
export function getMatchTypeStats(stats: HeadToHeadStats): MatchTypeStats {
  const result: MatchTypeStats = {
    group: {
      matches: 0,
      playerAWins: 0,
      playerBWins: 0,
      draws: 0,
      playerAGoals: 0,
      playerBGoals: 0,
    },
    knockout: {
      matches: 0,
      playerAWins: 0,
      playerBWins: 0,
      draws: 0,
      playerAGoals: 0,
      playerBGoals: 0,
      stages: {},
    },
    golden_goal: {
      matches: 0,
      playerAWins: 0,
      playerBWins: 0,
      draws: 0,
      playerAGoals: 0,
      playerBGoals: 0,
    },
  }

  for (const matchDetail of stats.matches) {
    const { match, matchType, scoreForPlayerA: scoreA, scoreForPlayerB: scoreB } = matchDetail

    if (matchType === 'group') {
      result.group.matches++
      result.group.playerAGoals += scoreA
      result.group.playerBGoals += scoreB
      if (scoreA > scoreB) result.group.playerAWins++
      else if (scoreB > scoreA) result.group.playerBWins++
      else result.group.draws++
    } else if (matchType === 'knockout') {
      result.knockout.matches++
      result.knockout.playerAGoals += scoreA
      result.knockout.playerBGoals += scoreB
      if (scoreA > scoreB) result.knockout.playerAWins++
      else if (scoreB > scoreA) result.knockout.playerBWins++
      else result.knockout.draws++

      // Track by stage
      if (match.stage) {
        result.knockout.stages[match.stage] = (result.knockout.stages[match.stage] || 0) + 1
      }
    } else if (matchType === 'golden_goal') {
      result.golden_goal.matches++
      result.golden_goal.playerAGoals += scoreA
      result.golden_goal.playerBGoals += scoreB
      if (scoreA > scoreB) result.golden_goal.playerAWins++
      else if (scoreB > scoreA) result.golden_goal.playerBWins++
      else result.golden_goal.draws++
    }
  }

  return result
}

/**
 * Win probability prediction based on head-to-head history.
 * Uses aggregate outcomes (wins/draws/losses) so the player with more
 * total wins always gets a higher win probability.
 */
export interface WinPrediction {
  playerAWinPct: number
  playerBWinPct: number
  drawPct: number
  totalMatches: number
}

function normalizePercentagesTo100(values: [number, number, number]): [number, number, number] {
  const floors: [number, number, number] = [
    Math.floor(values[0]),
    Math.floor(values[1]),
    Math.floor(values[2]),
  ]
  let remainder = 100 - (floors[0] + floors[1] + floors[2])
  const fractions = [
    { idx: 0 as const, frac: values[0] - floors[0] },
    { idx: 1 as const, frac: values[1] - floors[1] },
    { idx: 2 as const, frac: values[2] - floors[2] },
  ].sort((a, b) => b.frac - a.frac)

  for (let i = 0; i < fractions.length && remainder > 0; i++) {
    floors[fractions[i].idx] += 1
    remainder--
  }

  return floors
}

export function getWinPrediction(stats: HeadToHeadStats | null): WinPrediction | null {
  if (!stats || stats.totalMatches === 0) return null

  const totalMatches = stats.totalMatches
  const nonDrawMatches = stats.playerAWins + stats.playerBWins

  // Draw share from actual draw frequency.
  const rawD = (stats.draws / totalMatches) * 100

  let rawA = 0
  let rawB = 0
  if (nonDrawMatches > 0) {
    const remaining = 100 - rawD
    rawA = (stats.playerAWins / nonDrawMatches) * remaining
    rawB = (stats.playerBWins / nonDrawMatches) * remaining
  }

  const [playerAWinPct, playerBWinPct, drawPct] = normalizePercentagesTo100([rawA, rawB, rawD])

  return {
    playerAWinPct,
    playerBWinPct,
    drawPct,
    totalMatches: stats.totalMatches,
  }
}

/**
 * Get all unique player pairs that have played matches
 */
export function getAllPlayerPairs(matches: Match[], _players: Player[]): Array<[string, string]> {
  const pairs = new Set<string>()

  for (const match of matches) {
    if (match.scoreA === null || match.scoreB === null) continue

    const pair = [match.playerAId, match.playerBId].sort().join('|')
    pairs.add(pair)
  }

  return Array.from(pairs).map((pair) => {
    const [id1, id2] = pair.split('|')
    return [id1, id2] as [string, string]
  })
}
