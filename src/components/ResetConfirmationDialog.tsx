import { useState } from 'react'
import { reverseGeocode } from '../lib/geocoding'

interface ResetConfirmationDialogProps {
  isOpen: boolean
  onConfirm: (cityName: string) => void
  onCancel: () => void
  testMode?: boolean
}

export function ResetConfirmationDialog({ isOpen, onConfirm, onCancel, testMode = false }: ResetConfirmationDialogProps) {
  const [isRequestingLocation, setIsRequestingLocation] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [locationDenied, setLocationDenied] = useState(false)

  if (!isOpen) return null

  const handleConfirm = async () => {
    // In test mode, skip location requirement
    if (testMode) {
      onConfirm('Test Mode')
      return
    }

    setIsRequestingLocation(true)
    setLocationError(null)
    setLocationDenied(false)

    try {
      // Check if geolocation is available
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by your browser')
      }

      // Request location permission
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: false, // Use less strict accuracy for better compatibility
            timeout: 5000, // Shorter timeout
            maximumAge: 60000, // Accept cached location up to 1 minute old
          }
        )
      })

      const { latitude, longitude } = position.coords
      
      // Reverse geocode to get city name
      const cityName = await reverseGeocode(latitude, longitude)
      
      if (cityName) {
        onConfirm(cityName)
      } else {
        // If geocoding fails, don't allow reset
        setLocationDenied(true)
        setLocationError('Could not determine city name. Reset cannot proceed without location information.')
        setIsRequestingLocation(false)
      }
    } catch (error) {
      console.error('Failed to get location:', error)
      
      // Check if it's a permission denied error
      if (error instanceof GeolocationPositionError) {
        if (error.code === GeolocationPositionError.PERMISSION_DENIED) {
          setLocationDenied(true)
          setLocationError('Location permission denied. Reset cannot proceed without location access. Please allow location access in your browser settings.')
        } else if (error.code === GeolocationPositionError.POSITION_UNAVAILABLE) {
          setLocationDenied(true)
          setLocationError('Location unavailable. Reset cannot proceed without location access. Please ensure location services are enabled.')
        } else if (error.code === GeolocationPositionError.TIMEOUT) {
          setLocationDenied(true)
          setLocationError('Location request timed out. Reset cannot proceed without location access. Please try again.')
        } else {
          setLocationDenied(true)
          setLocationError('Could not get location. Reset cannot proceed without location access.')
        }
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Failed to get location'
        setLocationDenied(true)
        setLocationError(`${errorMessage}. Reset cannot proceed without location access.`)
      }
      setIsRequestingLocation(false)
    }
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
        {!testMode && (
          <div className="mb-4 rounded-card bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
            <p className="text-sm text-red-700 dark:text-red-300 font-semibold">
              ⚠️ Location sharing is REQUIRED. This helps track who started a new tournament. Cannot proceed without location access.
            </p>
          </div>
        )}
        {testMode && (
          <div className="mb-4 rounded-card bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4">
            <p className="text-sm text-amber-700 dark:text-amber-300 font-semibold">
              🧪 Test Mode: Location requirement is bypassed for local testing.
            </p>
          </div>
        )}
        {locationError && (
          <div className="mb-4 rounded-card border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
            <p className="text-sm text-red-700 dark:text-red-300 font-medium">{locationError}</p>
          </div>
        )}
        <div className="flex flex-wrap gap-3">
          {!testMode && locationDenied ? (
            <button
              type="button"
              onClick={onCancel}
              className="w-full rounded-button bg-gray-100 dark:bg-gray-700 px-4 py-2.5 font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isRequestingLocation}
                className="flex-1 rounded-button bg-red-500 dark:bg-red-600 px-4 py-2.5 font-semibold text-white hover:bg-red-600 dark:hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                {isRequestingLocation ? 'Getting location...' : 'Continue'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                disabled={isRequestingLocation}
                className="flex-1 rounded-button bg-gray-100 dark:bg-gray-700 px-4 py-2.5 font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
