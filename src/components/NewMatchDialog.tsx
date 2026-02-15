interface NewMatchDialogProps {
  isOpen: boolean
  onReplaySamePlayers: () => void | Promise<void>
  onSelectNewPlayers: () => void
  onCancel: () => void
}

export function NewMatchDialog({
  isOpen,
  onReplaySamePlayers,
  onSelectNewPlayers,
  onCancel,
}: NewMatchDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/70 p-4">
      <div className="w-full max-w-md rounded-card bg-white dark:bg-gray-800 p-6 shadow-xl border border-gray-200 dark:border-gray-700 transition-colors">
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">Start a New Match</h2>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          How would you like to start?
        </p>
        <div className="space-y-3">
          <button
            type="button"
            onClick={async () => {
              await onReplaySamePlayers()
              onCancel()
            }}
            className="w-full rounded-button bg-neobank-lime px-4 py-3 font-semibold text-white hover:bg-neobank-lime-dark transition-colors shadow-sm"
          >
            Replay with same players
          </button>
          <button
            type="button"
            onClick={() => {
              onSelectNewPlayers()
              onCancel()
            }}
            className="w-full rounded-button bg-gray-100 dark:bg-gray-700 px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Select new players
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="w-full rounded-button border-2 border-gray-300 dark:border-gray-600 px-4 py-2.5 font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
