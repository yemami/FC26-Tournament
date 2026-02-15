import type { Match, Player } from '../types'

export interface RecordEntry {
  playerName: string
  value: number
  opponentName?: string
  score?: string
}

export interface Records {
  mostGoalsInOneGame: { value: number; entries: RecordEntry[] }
  biggestWin: { value: number; entries: Array<{ winnerName: string; loserName: string; score: string }> }
  mostTotalGoals: { value: number; entries: RecordEntry[] }
  mostWins: { value: number; entries: RecordEntry[] }
}

function getPlayerName(players: Player[], id: string): string {
  return players.find((p) => p.id === id)?.name ?? `Player ${id.slice(0, 8)}`
}

/**
 * Compute all-time records from played matches.
 * Aggregates by player name (handles duplicate IDs for same person).
 */
export function computeRecords(matches: Match[], players: Player[]): Records {
  const played = matches.filter((m) => m.scoreA !== null && m.scoreB !== null)
  const getName = (id: string) => getPlayerName(players, id)

  // Most goals in a single game (by one player in one match)
  let mostGoalsInOneGame = 0
  const mostGoalsEntries: RecordEntry[] = []
  for (const m of played) {
    const sa = m.scoreA!
    const sb = m.scoreB!
    const nameA = getName(m.playerAId)
    const nameB = getName(m.playerBId)
    if (sa > mostGoalsInOneGame) {
      mostGoalsInOneGame = sa
      mostGoalsEntries.length = 0
      mostGoalsEntries.push({ playerName: nameA, value: sa, opponentName: nameB, score: `${sa}-${sb}` })
    } else if (sa === mostGoalsInOneGame && mostGoalsInOneGame > 0) {
      if (!mostGoalsEntries.some((e) => e.playerName === nameA && e.score === `${sa}-${sb}`)) {
        mostGoalsEntries.push({ playerName: nameA, value: sa, opponentName: nameB, score: `${sa}-${sb}` })
      }
    }
    if (sb > mostGoalsInOneGame) {
      mostGoalsInOneGame = sb
      mostGoalsEntries.length = 0
      mostGoalsEntries.push({ playerName: nameB, value: sb, opponentName: nameA, score: `${sa}-${sb}` })
    } else if (sb === mostGoalsInOneGame && mostGoalsInOneGame > 0) {
      if (!mostGoalsEntries.some((e) => e.playerName === nameB && e.score === `${sa}-${sb}`)) {
        mostGoalsEntries.push({ playerName: nameB, value: sb, opponentName: nameA, score: `${sa}-${sb}` })
      }
    }
  }

  // Biggest win (margin)
  let biggestMargin = 0
  const biggestWinEntries: Array<{ winnerName: string; loserName: string; score: string }> = []
  for (const m of played) {
    const sa = m.scoreA!
    const sb = m.scoreB!
    const margin = Math.abs(sa - sb)
    if (margin > biggestMargin && (sa !== sb)) {
      biggestMargin = margin
      biggestWinEntries.length = 0
      if (sa > sb) {
        biggestWinEntries.push({
          winnerName: getName(m.playerAId),
          loserName: getName(m.playerBId),
          score: `${sa}-${sb}`,
        })
      } else {
        biggestWinEntries.push({
          winnerName: getName(m.playerBId),
          loserName: getName(m.playerAId),
          score: `${sa}-${sb}`,
        })
      }
    } else if (margin === biggestMargin && margin > 0 && (sa !== sb)) {
      const winner = sa > sb ? getName(m.playerAId) : getName(m.playerBId)
      const loser = sa > sb ? getName(m.playerBId) : getName(m.playerAId)
      const score = `${sa}-${sb}`
      if (!biggestWinEntries.some((e) => e.winnerName === winner && e.loserName === loser && e.score === score)) {
        biggestWinEntries.push({ winnerName: winner, loserName: loser, score })
      }
    }
  }

  // Most total goals (all-time) - aggregate by name
  const goalsByName = new Map<string, number>()
  for (const m of played) {
    const nameA = getName(m.playerAId)
    const nameB = getName(m.playerBId)
    goalsByName.set(nameA, (goalsByName.get(nameA) ?? 0) + m.scoreA!)
    goalsByName.set(nameB, (goalsByName.get(nameB) ?? 0) + m.scoreB!)
  }
  let mostTotalGoalsVal = 0
  const mostTotalEntries: RecordEntry[] = []
  for (const [name, goals] of goalsByName) {
    if (goals > mostTotalGoalsVal) {
      mostTotalGoalsVal = goals
      mostTotalEntries.length = 0
      mostTotalEntries.push({ playerName: name, value: goals })
    } else if (goals === mostTotalGoalsVal && goals > 0) {
      mostTotalEntries.push({ playerName: name, value: goals })
    }
  }

  // Most wins - aggregate by name
  const winsByName = new Map<string, number>()
  for (const m of played) {
    if (m.scoreA === m.scoreB) continue
    const winnerId = m.scoreA! > m.scoreB! ? m.playerAId : m.playerBId
    const winnerName = getName(winnerId)
    winsByName.set(winnerName, (winsByName.get(winnerName) ?? 0) + 1)
  }
  let mostWinsVal = 0
  const mostWinsEntries: RecordEntry[] = []
  for (const [name, wins] of winsByName) {
    if (wins > mostWinsVal) {
      mostWinsVal = wins
      mostWinsEntries.length = 0
      mostWinsEntries.push({ playerName: name, value: wins })
    } else if (wins === mostWinsVal && wins > 0) {
      mostWinsEntries.push({ playerName: name, value: wins })
    }
  }

  return {
    mostGoalsInOneGame: { value: mostGoalsInOneGame, entries: mostGoalsEntries },
    biggestWin: { value: biggestMargin, entries: biggestWinEntries },
    mostTotalGoals: { value: mostTotalGoalsVal, entries: mostTotalEntries },
    mostWins: { value: mostWinsVal, entries: mostWinsEntries },
  }
}
