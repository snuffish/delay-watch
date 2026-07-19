import { useLocalStorage } from './useLocalStorage'

export const SELECTED_STATIONS_STORAGE_KEY = 'delaywatch.selectedStations'
export const DEFAULT_SELECTED_STATIONS = ['SK', 'G', 'T', 'N', 'JÖ', 'THN']

/**
 * The scanner's selected station codes, persisted to localStorage and shared
 * across routes (Live Scanner + Station Explorer) via the same storage key.
 */
export function useSelectedStations() {
  const [selectedStations, setSelectedStations] = useLocalStorage<string[]>(
    SELECTED_STATIONS_STORAGE_KEY,
    DEFAULT_SELECTED_STATIONS
  )

  const isSelected = (code: string) => selectedStations.includes(code.trim().toUpperCase())

  const addStation = (code: string) => {
    const normalized = code.trim().toUpperCase()
    if (!normalized) return
    setSelectedStations(prev => (prev.includes(normalized) ? prev : [...prev, normalized]))
  }

  const removeStation = (code: string) => {
    const normalized = code.trim().toUpperCase()
    setSelectedStations(prev => prev.filter(c => c !== normalized))
  }

  const clearStations = () => setSelectedStations([])

  return { selectedStations, setSelectedStations, isSelected, addStation, removeStation, clearStations }
}
