import type { StandingsRow } from '../types'

/**
 * Detect groups of players with identical points and goalsFor (tied for tie-break).
 * Returns pairs of player IDs that need a golden goal match.
 */
export function getTiedPairs(standings: StandingsRow[]): [string, string][] {
  const pairs: [string, string][] = []
  const seen = new Set<string>()

  for (let i = 0; i < standings.length; i++) {
    if (!standings[i].isTied) continue
    const group: StandingsRow[] = [standings[i]]
    for (let j = i + 1; j < standings.length && standings[j].points === standings[i].points && standings[j].goalsFor === standings[i].goalsFor; j++) {
      group.push(standings[j])
    }
    for (let a = 0; a < group.length; a++) {
      for (let b = a + 1; b < group.length; b++) {
        const idA = group[a].playerId
        const idB = group[b].playerId
        const key = [idA, idB].sort().join('-')
        if (!seen.has(key)) {
          seen.add(key)
          pairs.push([idA, idB])
        }
      }
    }
    i += group.length - 1
  }

  return pairs
}

/**
 * Create golden goal match objects for tied pairs.
 * These are stored separately or with isGoldenGoal flag and status 'golden_goal'.
 */
export function createGoldenGoalMatches(
  tiedPairs: [string, string][],
  existingGoldenGoalMatchIds: Set<string>
): { id: string; playerAId: string; playerBId: string; roundIndex: number; scoreA: number | null; scoreB: number | null; status: 'golden_goal'; isGoldenGoal: true }[] {
  const roundIndex = -1
  return tiedPairs.map(([playerAId, playerBId], idx) => {
    const id = `golden-${playerAId}-${playerBId}-${idx}`
    if (existingGoldenGoalMatchIds.has(id)) return null
    return {
      id,
      playerAId,
      playerBId,
      roundIndex,
      scoreA: null as number | null,
      scoreB: null as number | null,
      status: 'golden_goal' as const,
      isGoldenGoal: true as const,
    }
  }).filter(Boolean) as {
    id: string
    playerAId: string
    playerBId: string
    roundIndex: number
    scoreA: number | null
    scoreB: number | null
    status: 'golden_goal'
    isGoldenGoal: true
  }[]
}
