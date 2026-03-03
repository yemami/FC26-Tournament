import type { Match, Player } from '../types'
import type { DatabaseActivityLog } from './supabase'

export type ActivityAction =
  | 'score_set'
  | 'score_edit'
  | 'comment_set'
  | 'comment_edit'
  | 'comment_clear'

export interface ActivityDetails {
  playerAId?: string
  playerBId?: string
  roundIndex?: number
  stage?: string | null
  prevScoreA?: number | null
  prevScoreB?: number | null
  scoreA?: number | null
  scoreB?: number | null
  prevComment?: string | null
  comment?: string | null
}

export type ActivityLogEntry = DatabaseActivityLog & { details?: ActivityDetails | null }

const stageLabels: Record<string, string> = {
  play_in: 'Play-in',
  semi: 'Semi-finals',
  final: 'Final',
  third_place: '3rd Place',
}

function getStageLabel(stage?: string | null): string | null {
  if (!stage) return null
  return stageLabels[stage] ?? 'Knockout'
}

function formatScore(scoreA?: number | null, scoreB?: number | null): string | null {
  if (scoreA === null || scoreA === undefined) return null
  if (scoreB === null || scoreB === undefined) return null
  return `${scoreA}–${scoreB}`
}

export function resolveActivityMatchInfo(
  entry: ActivityLogEntry,
  matchMap: Map<string, Match>,
  playerMap: Map<string, Player>
) {
  const details = (entry.details ?? {}) as ActivityDetails
  const match = entry.match_id ? matchMap.get(entry.match_id) : undefined
  const playerAId = details.playerAId ?? match?.playerAId
  const playerBId = details.playerBId ?? match?.playerBId
  const playerAName = playerAId ? playerMap.get(playerAId)?.name ?? 'Player A' : 'Player A'
  const playerBName = playerBId ? playerMap.get(playerBId)?.name ?? 'Player B' : 'Player B'
  const roundIndex = details.roundIndex ?? match?.roundIndex
  const stage = details.stage ?? match?.stage ?? null
  const stageLabel = getStageLabel(stage)
  const roundLabel = stageLabel ?? (roundIndex !== undefined && roundIndex >= 0 ? `Round ${roundIndex + 1}` : 'Match')

  return {
    details,
    playerAName,
    playerBName,
    roundLabel,
  }
}

export function describeActivity(
  entry: ActivityLogEntry,
  matchMap: Map<string, Match>,
  playerMap: Map<string, Player>
) {
  const { details, playerAName, playerBName, roundLabel } = resolveActivityMatchInfo(entry, matchMap, playerMap)
  const actor = entry.actor_label || 'Someone'
  const score = formatScore(details.scoreA, details.scoreB)
  const prevScore = formatScore(details.prevScoreA, details.prevScoreB)

  let description = ''
  let actionLabel = ''

  switch (entry.action) {
    case 'score_set':
      actionLabel = 'Score set'
      description = score ? `Score set to ${score}.` : 'Score was set.'
      break
    case 'score_edit':
      actionLabel = 'Score edited'
      if (score && prevScore) {
        description = `Score changed ${prevScore} → ${score}.`
      } else if (score) {
        description = `Score updated to ${score}.`
      } else {
        description = 'Score updated.'
      }
      break
    case 'comment_set':
      actionLabel = 'Comment added'
      description = 'Comment added.'
      break
    case 'comment_edit':
      actionLabel = 'Comment edited'
      description = 'Comment updated.'
      break
    case 'comment_clear':
      actionLabel = 'Comment removed'
      description = 'Comment removed.'
      break
    default:
      actionLabel = 'Update'
      description = 'Activity update.'
  }

  return {
    title: `${playerAName} vs ${playerBName}`,
    roundLabel,
    actor,
    actionLabel,
    description,
    score,
    comment: details.comment ?? null,
  }
}

export function formatActivityToast(
  entry: ActivityLogEntry,
  matchMap: Map<string, Match>,
  playerMap: Map<string, Player>
): string {
  const { title, roundLabel, actor, score } = describeActivity(entry, matchMap, playerMap)

  switch (entry.action) {
    case 'score_set':
    case 'score_edit':
      return score
        ? `${roundLabel}: ${title} ${score} (by ${actor})`
        : `${roundLabel}: ${title} updated (by ${actor})`
    case 'comment_set':
      return `${roundLabel}: Comment added on ${title} (by ${actor})`
    case 'comment_edit':
      return `${roundLabel}: Comment edited on ${title} (by ${actor})`
    case 'comment_clear':
      return `${roundLabel}: Comment removed on ${title} (by ${actor})`
    default:
      return `${roundLabel}: ${title} updated (by ${actor})`
  }
}
