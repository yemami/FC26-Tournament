import type { Player } from '../types'

const BYE_ID = '__BYE__'

/**
 * Generate round-robin schedule using the circle method.
 * For odd N, a "bye" is used so one player sits out each round.
 * Each pair meets exactly once.
 */
export function generateRoundRobinSchedule(players: Player[]): { playerAId: string; playerBId: string; roundIndex: number }[] {
  if (players.length < 2) return []

  const ids = players.map((p) => p.id)
  const n = ids.length
  const isOdd = n % 2 === 1
  const rotating = isOdd ? [...ids, BYE_ID] : [...ids]
  const count = rotating.length
  const rounds = isOdd ? n : n - 1
  const matches: { playerAId: string; playerBId: string; roundIndex: number }[] = []

  for (let r = 0; r < rounds; r++) {
    for (let i = 0; i < count / 2; i++) {
      const a = rotating[i]
      const b = rotating[count - 1 - i]
      if (a !== BYE_ID && b !== BYE_ID) {
        matches.push({ playerAId: a, playerBId: b, roundIndex: r })
      }
    }
    // Rotate: keep index 0 fixed, rotate the rest
    const fixed = rotating[0]
    const rest = rotating.slice(1)
    rest.unshift(rest.pop()!)
    rotating.length = 0
    rotating.push(fixed, ...rest)
  }

  return matches
}
