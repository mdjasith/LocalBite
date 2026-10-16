import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useLocation as useAppLocation } from '../../context/LocationContext'
import { nearbySellers } from '../../api/locationApi'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import {
  MapPinIcon, ArrowLeftIcon, SearchIcon, XIcon, StoreIcon, CheckIcon,
} from '../../components/icons'

const PRESET_LOCATIONS = [
  { label: 'Perungudi, Chennai', latitude: 12.9716, longitude: 80.2447, address: 'Perungudi, Chennai' },
  { label: 'Velachery, Chennai', latitude: 12.9815, longitude: 80.2180, address: 'Velachery, Chennai' },
  { label: 'Adyar, Chennai', latitude: 13.0067, longitude: 80.2572, address: 'Adyar, Chennai' },
]

export default function Location() {
  const navigate = useNavigate()
  const { setLocation, location } = useAppLocation()

  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)

  const [nearby, setNearby] = useState([])
  const [checking, setChecking] = useState(false)
  const [selected, setSelected] = useState(null)

  // Debounced search using Nominatim (free OSM geocoder)
  useEffect(() => {
    if (query.trim().length < 3) { setResults([]); return }
    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=6&addressdetails=1`
        const res = await fetch(url, {
          headers: { 'Accept': 'application/json' },
        })
        const data = await res.json()
        const mapped = (Array.isArray(data) ? data : []).map((r) => ({
          label: r.display_name,
          shortLabel: r.display_name.split(',').slice(0, 3).join(','),
          latitude: parseFloat(r.lat),
          longitude: parseFloat(r.lon),
        }))
        setResults(mapped)
      } catch {
        toast.error('Search failed. Try again.')
      } finally {
        setSearching(false)
      }
    }, 600)
    return () => clearTimeout(timer)
  }, [query])

  const checkNearby = async (lat, lng, address) => {
    setChecking(true)
    setSelected({ latitude: lat, longitude: lng, address })
    try {
      const data = await nearbySellers(lat, lng, 10)
      setNearby(Array.isArray(data) ? data : [])
    } catch {
      setNearby([])
    } finally {
      setChecking(false)
    }
  }

  const handlePickResult = (r) => {
    setQuery(r.shortLabel)
    setResults([])
    checkNearby(r.latitude, r.longitude, r.shortLabel)
  }

  const handlePickPreset = (p) => {
    setQuery(p.label)
    setResults([])
    checkNearby(p.latitude, p.longitude, p.address)
  }

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) { toast.error('Geolocation not supported'); return }
    setChecking(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        checkNearby(lat, lng, `${lat.toFixed(4)}, ${lng.toFixed(4)}`)
      },
      () => { toast.error('Could not get location'); setChecking(false) },
      { timeout: 8000 }
    )
  }

  const handleConfirm = () => {
    if (!selected) return
    if (nearby.length === 0) {
      toast.error('No sellers available here. Try another location.')
      return
    }
    setLocation({
      address: selected.address,
      latitude: selected.latitude,
      longitude: selected.longitude,
    })
    toast.success('Location saved')
    navigate(-1)
  }

  return (
    <div className="page container" style={{ padding: '24px 24px 80px', maxWidth: 640 }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '8px 14px', borderRadius: 9999, background: 'white',
          border: '1px solid var(--border-1)', fontSize: 14, fontWeight: 600,
          marginBottom: 20, cursor: 'pointer',
        }}
      >
        <ArrowLeftIcon size={16} /> Back
      </button>

      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Delivery location</h1>
      <p style={{ color: 'var(--text-3)', fontSize: 14, marginBottom: 20 }}>
        Search any place — powered by OpenStreetMap
      </p>

      {/* Search input */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '0 14px', background: 'white',
          borderRadius: 'var(--r-md)', border: '1.5px solid var(--border-1)',
          height: 48,
        }}>
          <SearchIcon size={18} color="var(--text-4)" />
          <input
            type="text"
            placeholder="Search area, street, city..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1, border: 'none', outline: 'none',
              font: '400 15px Inter', background: 'transparent',
            }}
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setResults([]) }}
              style={{ color: 'var(--text-4)', cursor: 'pointer' }}
            >
              <XIcon size={16} />
            </button>
          )}
        </div>

        {/* Search results */}
        {searching && (
          <div style={{ padding: 12, fontSize: 13, color: 'var(--text-4)' }}>
            Searching...
          </div>
        )}

        {results.length > 0 && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0,
            background: 'white', borderRadius: 'var(--r-md)',
            boxShadow: '0 12px 32px rgba(0,0,0,0.12)', marginTop: 6,
            zIndex: 50, maxHeight: 320, overflowY: 'auto',
            border: '1px solid var(--border-1)',
          }}>
            {results.map((r, i) => (
              <button
                key={i}
                onClick={() => handlePickResult(r)}
                style={{
                  width: '100%', padding: '12px 16px', display: 'flex',
                  gap: 10, cursor: 'pointer', textAlign: 'left',
                  borderBottom: '1px solid var(--border-2)', background: 'transparent',
                }}
              >
                <MapPinIcon size={16} color="var(--brand-primary)" style={{ flexShrink: 0, marginTop: 2 }} />
                <div style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--text-2)' }}>
                  {r.label}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Preset + GPS buttons */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <Button variant="outline" onClick={handleUseCurrentLocation} size="sm">
          <MapPinIcon size={14} /> Use my GPS
        </Button>
        {PRESET_LOCATIONS.map((p) => (
          <button
            key={p.label}
            onClick={() => handlePickPreset(p)}
            style={{
              padding: '8px 14px', borderRadius: 9999, fontSize: 12, fontWeight: 600,
              border: '1.5px solid var(--border-1)', background: 'white',
              cursor: 'pointer', color: 'var(--text-2)',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Selected location + nearby sellers */}
      {selected && (
        <>
          <div className="card" style={{ padding: 16, marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--text-4)', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>
              Selected location
            </div>
            <div style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.5 }}>
              {selected.address}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <StoreIcon size={16} color="var(--brand-primary)" />
              <span style={{ fontWeight: 700, fontSize: 14 }}>
                Sellers within 10 km
              </span>
            </div>

            {checking ? (
              <Loader />
            ) : nearby.length === 0 ? (
              <div className="card" style={{ padding: 24, textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🚫</div>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>No sellers here</div>
                <div style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.6 }}>
                  There are no active sellers within 10 km of this location.
                  Try a nearby area or Chennai.
                </div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 12, color: 'var(--text-4)', marginBottom: 8 }}>
                  {nearby.length} seller{nearby.length !== 1 ? 's' : ''} found
                </div>
                <div className="card" style={{ padding: 10 }}>
                  {nearby.map((s) => (
                    <div key={s.sellerId} style={{
                      display: 'flex', gap: 10, alignItems: 'center',
                      padding: 10, borderBottom: '1px solid var(--border-2)',
                    }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: 'var(--gradient-primary)', color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, flexShrink: 0,
                      }}>
                        {s.storeName?.[0] || 'S'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {s.storeName}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-4)' }}>
                          {s.distanceKm} km · {s.city}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button block size="lg" onClick={handleConfirm} style={{ marginTop: 12 }}>
                  <CheckIcon size={16} /> Use this location
                </Button>
              </>
            )}
          </div>
        </>
      )}

      {location && !selected && (
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 11, color: 'var(--text-4)', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>
            Currently set
          </div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>
            {location.address}
          </div>
        </div>
      )}
    </div>
  )
}