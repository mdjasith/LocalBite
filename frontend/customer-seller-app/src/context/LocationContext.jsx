import { createContext, useContext, useState } from 'react'
import { DEFAULT_LOCATION } from '../utils/constants'

const LocationContext = createContext(null)

export function LocationProvider({ children }) {
  const [location, setLocationState] = useState(() => {
    const saved = localStorage.getItem('lb_location')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return null
      }
    }
    return null
  })

  const setLocation = (loc) => {
    setLocationState(loc)
    localStorage.setItem('lb_location', JSON.stringify(loc))
  }

  const clearLocation = () => {
    setLocationState(null)
    localStorage.removeItem('lb_location')
  }

  const value = {
    location,
    hasLocation: !!location,
    latitude: location?.latitude || null,
    longitude: location?.longitude || null,
    address: location?.address || null,
    setLocation,
    clearLocation,
    defaultLocation: DEFAULT_LOCATION,
  }

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>
}

export function useLocation() {
  const ctx = useContext(LocationContext)
  if (!ctx) throw new Error('useLocation must be used inside LocationProvider')
  return ctx
}