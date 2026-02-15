import { useState, useEffect } from 'react'

type AddPlayerResult = { player: { id: string; name: string }; isNew: boolean } | null

interface AddPlayerModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (name: string) => Promise<AddPlayerResult>
  existingPlayers: { id: string; name: string }[]
}

export function AddPlayerModal({ isOpen, onClose, onAdd, existingPlayers }: AddPlayerModalProps) {
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [pendingAdd, setPendingAdd] = useState<string | null>(null)
  const [similarPlayers, setSimilarPlayers] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    if (!isOpen) {
      setName('')
      setError(null)
      setInfo(null)
      setSuccess(null)
      setPendingAdd(null)
      setSimilarPlayers([])
    }
  }, [isOpen])

  const doAdd = async (trimmed: string) => {
    setIsSubmitting(true)
    setError(null)
    setInfo(null)
    setSuccess(null)
    try {
      const result = await onAdd(trimmed)
      if (result) {
        if (result.isNew) {
          setSuccess(`${result.player.name} added to database successfully!`)
          setName('')
          setPendingAdd(null)
          setSimilarPlayers([])
          setTimeout(() => {
            setSuccess(null)
            onClose()
          }, 1500)
        } else {
          setInfo(`${result.player.name} is already in the database.`)
          setName('')
          setPendingAdd(null)
          setSimilarPlayers([])
        }
      } else {
        setError('Could not add player. Try again.')
        setPendingAdd(null)
      }
    } catch {
      setError('Something went wrong.')
      setPendingAdd(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    if (existingPlayers.length > 0) {
      setSimilarPlayers(existingPlayers)
      setPendingAdd(trimmed)
      return
    }
    await doAdd(trimmed)
  }

  const handleConfirmAddAnyway = () => {
    if (pendingAdd) {
      doAdd(pendingAdd)
    }
  }

  const handleCancelSimilar = () => {
    setPendingAdd(null)
    setSimilarPlayers([])
  }

  if (!isOpen) return null

  if (pendingAdd && similarPlayers.length > 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/70 p-4">
        <div className="w-full max-w-md rounded-card bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Confirm before adding</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Check that &quot;{pendingAdd}&quot; is not already in the database under a different name. Existing players:
          </p>
          <ul className="mb-4 rounded-button bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 space-y-1">
            {similarPlayers.map((p) => (
              <li key={p.id} className="text-sm font-medium text-amber-800 dark:text-amber-200">
                • {p.name}
              </li>
            ))}
          </ul>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={handleCancelSimilar}
              className="rounded-button bg-gray-100 dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmAddAnyway}
              disabled={isSubmitting}
              className="rounded-button bg-neobank-lime px-4 py-2 text-sm font-semibold text-white hover:bg-neobank-lime-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Adding...' : 'Add anyway'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/70 p-4">
      <div className="w-full max-w-md rounded-card bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Add new player to database</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Add a player to the database. They will appear in the list for future tournaments.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Player name"
            className="w-full rounded-button border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-neobank-lime focus:outline-none transition-colors"
            disabled={isSubmitting}
          />
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          {info && (
            <p className="text-sm text-amber-600 dark:text-amber-400">{info}</p>
          )}
          {success && (
            <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
          )}
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-button bg-gray-100 dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="rounded-button bg-neobank-lime px-4 py-2 text-sm font-semibold text-white hover:bg-neobank-lime-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Adding...' : 'Add to database'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
