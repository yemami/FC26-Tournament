import { useState } from 'react'

interface ScoreInputProps {
  onSave: (scoreA: number, scoreB: number) => void
  onCancel?: () => void
  isGoldenGoal?: boolean
  initialA?: number | null
  initialB?: number | null
}

export function ScoreInput({
  onSave,
  onCancel,
  isGoldenGoal,
  initialA = null,
  initialB = null,
}: ScoreInputProps) {
  const [scoreA, setScoreA] = useState(initialA ?? 0)
  const [scoreB, setScoreB] = useState(initialB ?? 0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isGoldenGoal) {
      const sa = scoreA >= 1 ? 1 : 0
      const sb = scoreB >= 1 ? 1 : 0
      if (sa + sb !== 1) return
      onSave(sa, sb)
    } else {
      if (scoreA < 0 || scoreB < 0) return
      onSave(scoreA, scoreB)
    }
  }

  if (isGoldenGoal) {
    return (
      <form onSubmit={handleSubmit} className="mt-2 flex flex-wrap items-center gap-2">
        <span className="text-xs text-amber-400">First goal wins</span>
        <label className="flex items-center gap-1">
          <span className="text-sm text-slate-400">A</span>
          <input
            type="number"
            min={0}
            max={1}
            value={scoreA}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10)
              if (v === 1) {
                setScoreA(1)
                setScoreB(0)
              } else {
                setScoreA(0)
              }
            }}
            className="w-14 rounded border border-slate-600 bg-slate-800 px-2 py-1 text-center text-slate-100"
          />
        </label>
        <span className="text-slate-500">–</span>
        <label className="flex items-center gap-1">
          <span className="text-sm text-slate-400">B</span>
          <input
            type="number"
            min={0}
            max={1}
            value={scoreB}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10)
              if (v === 1) {
                setScoreB(1)
                setScoreA(0)
              } else {
                setScoreB(0)
              }
            }}
            className="w-14 rounded border border-slate-600 bg-slate-800 px-2 py-1 text-center text-slate-100"
          />
        </label>
        <button
          type="submit"
          disabled={scoreA + scoreB !== 1}
          className="rounded bg-emerald-600 px-3 py-1 text-sm text-white hover:bg-emerald-500 disabled:opacity-50"
        >
          Save
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="text-sm text-slate-400 hover:text-slate-300">
            Cancel
          </button>
        )}
      </form>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex flex-wrap items-center gap-2">
      <label className="flex items-center gap-1">
        <input
          type="number"
          min={0}
          value={scoreA}
          onChange={(e) => setScoreA(Math.max(0, parseInt(e.target.value, 10) || 0))}
          className="w-14 rounded border border-slate-600 bg-slate-800 px-2 py-1 text-center text-slate-100"
        />
      </label>
      <span className="text-slate-500">–</span>
      <label className="flex items-center gap-1">
        <input
          type="number"
          min={0}
          value={scoreB}
          onChange={(e) => setScoreB(Math.max(0, parseInt(e.target.value, 10) || 0))}
          className="w-14 rounded border border-slate-600 bg-slate-800 px-2 py-1 text-center text-slate-100"
        />
      </label>
      <button type="submit" className="rounded bg-emerald-600 px-3 py-1 text-sm text-white hover:bg-emerald-500">
        Save
      </button>
      {onCancel && (
        <button type="button" onClick={onCancel} className="text-sm text-slate-400 hover:text-slate-300">
          Cancel
        </button>
      )}
    </form>
  )
}
