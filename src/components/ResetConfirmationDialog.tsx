interface ResetConfirmationDialogProps {
  isOpen: boolean
  onConfirm: (cityName?: string | null) => void
  onCancel: () => void
}

export function ResetConfirmationDialog({ isOpen, onConfirm, onCancel }: ResetConfirmationDialogProps) {
  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm(null)
  }


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/70 p-4">
      <div className="w-full max-w-md rounded-card bg-white dark:bg-gray-800 p-6 shadow-xl border border-gray-200 dark:border-gray-700 transition-colors">
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">⚠️ Start with New Players</h2>
        <p className="mb-4 text-gray-700 dark:text-gray-300 font-medium">
          This will clear the current tournament and take you to the setup page to add new players. Match history will be preserved.
        </p>
        <ul className="mb-4 ml-6 list-disc space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li>Clear current players and matches</li>
          <li>Go to setup to add new players</li>
          <li>Match history and head-to-head records are preserved</li>
        </ul>
        <div className="mb-4 rounded-card bg-neobank-lime/10 dark:bg-neobank-lime/20 border border-neobank-lime/30 dark:border-neobank-lime/40 p-4">
          <p className="text-sm text-neobank-lime font-semibold">
            ✅ Reset will be tracked by the signed-in user.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 rounded-button bg-red-500 dark:bg-red-600 px-4 py-2.5 font-semibold text-white hover:bg-red-600 dark:hover:bg-red-700 transition-colors shadow-sm"
          >
            Continue
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-button bg-gray-100 dark:bg-gray-700 px-4 py-2.5 font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
