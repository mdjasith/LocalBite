import { createContext, useContext, useEffect, useState } from 'react'

const LocationContext = createContext(null)

export function LocationProvider({ children }) {
  const [location, setLocation] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem('lb_location')
    if (saved) {
      try { setLocation(JSON.parse(saved)) } catch { /* ignore */ }
    }
  }, [])

  const saveLocation = (loc) => {
    setLocation(loc)
    localStorage.setItem('lb_location', JSON.stringify(loc))
  }

  const clearLocation = () => {
    setLocation(null)
    localStorage.removeItem('lb_location')
  }

  return (
    <LocationContext.Provider value={{ location, saveLocation, clearLocation, hasLocation: !!location }}>
      {children}
    </LocationContext.Provider>
  )
}

export function useLocation() {
  const ctx = useContext(LocationContext)
  if (!ctx) throw new Error('useLocation must be used inside LocationProvider')
  return ctx
}