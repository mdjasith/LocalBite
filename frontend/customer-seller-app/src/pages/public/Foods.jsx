import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useLocation as useRouterLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { listFoods, listCategories } from '../../api/foodApi'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useLocation } from '../../context/LocationContext'
import { fetchFoodImageWithFallbacks } from '../../utils/foodImageApi'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import EmptyState from '../../components/common/EmptyState'
import {
  SearchIcon, ClockIcon, PlusIcon, FlameIcon, LeafIcon,
  UtensilsIcon, XIcon, MapPinIcon,
} from '../../components/icons'
import { formatCurrencyShort } from '../../utils/formatCurrency'

const IMG_POOL = [
  'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80',
  'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&q=80',
  'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&q=80',
  'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&q=80',
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80',
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
]
function pickImage(seed) {
  const idx = Number(String(seed || '0').split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % IMG_POOL.length
  return IMG_POOL[idx]
}

export default function Foods() {
  const navigate = useNavigate()
  const routerLocation = useRouterLocation()
  const { isAuthenticated, role } = useAuth()
  const { addItem } = useCart()
  const { location, hasLocation } = useLocation()

  const [allFoods, setAllFoods] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeCategory, setActiveCategory] = useState(null)
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [sortBy, setSortBy] = useState('default')
  const [adding, setAdding] = useState(null)
  const [realImages, setRealImages] = useState({})
  const searchWrapRef = useRef(null)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const [f, c] = await Promise.all([
          listFoods().catch(() => []),
          listCategories().catch(() => []),
        ])
        setAllFoods(Array.isArray(f) ? f : [])
        setCategories(Array.isArray(c) ? c : [])
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  useEffect(() => {
    const onClickOutside = (e) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  // Load real images for the first 12 dishes only (browser-safe)
  useEffect(() => {
    if (!allFoods.length) return
    let cancelled = false
    ;(async () => {
      for (const food of allFoods.slice(0, 12)) {
        if (cancelled) return
        if (realImages[food.foodId]) continue
        const url = await fetchFoodImageWithFallbacks(food.foodName)
        if (url && !cancelled) {
          setRealImages((prev) => ({ ...prev, [food.foodId]: url }))
        }
        await new Promise((r) => setTimeout(r, 100))
      }
    })()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allFoods])

  const suggestions = useMemo(() => {
    if (!keyword.trim()) return []
    const q = keyword.trim().toLowerCase()
    return allFoods.filter((f) => f.foodName && f.foodName.toLowerCase().includes(q)).slice(0, 8)
  }, [keyword, allFoods])

  const displayed = useMemo(() => {
    let list = [...allFoods]
    if (keyword.trim()) {
      const q = keyword.toLowerCase().trim()
      list = list.filter((f) =>
        (f.foodName && f.foodName.toLowerCase().includes(q)) ||
        (f.description && f.description.toLowerCase().includes(q))
      )
    }
    if (activeCategory) list = list.filter((f) => f.categoryId === activeCategory)
    if (typeFilter !== 'ALL') list = list.filter((f) => f.foodType === typeFilter)
    if (sortBy === 'price_asc') list.sort((a, b) => Number(a.price) - Number(b.price))
    if (sortBy === 'price_desc') list.sort((a, b) => Number(b.price) - Number(a.price))
    if (sortBy === 'time_asc') list.sort((a, b) => a.preparationTimeMinutes - b.preparationTimeMinutes)
    return list
  }, [allFoods, keyword, activeCategory, typeFilter, sortBy])

  const getImage = (food) => realImages[food.foodId] || food.imageUrl || pickImage(food.foodId)

  const handleAdd = async (food) => {
    if ((food.stockQuantity || 0) <= 0) { toast.error('Out of stock'); return }
    if (!isAuthenticated || role !== 'CUSTOMER') {
      toast('Please login to add items to cart')
      navigate('/login', { state: { from: routerLocation } })
      return
    }
    setAdding(food.foodId)
    try {
      await addItem(food.foodId, 1)
      toast.success('Added to cart')
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Could not add')
    } finally {
      setAdding(null)
    }
  }

  return (
    <div className="page container" style={{ padding: '32px 24px 80px' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 28, marginBottom: 6 }}>Browse dishes</h1>
        {hasLocation ? (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-3)' }}>
            <MapPinIcon size={13} /> Delivering to <strong>{location.address}</strong>
          </div>
        ) : (
          <button onClick={() => navigate('/customer/location')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--brand-primary)', fontWeight: 600, cursor: 'pointer' }}>
            <MapPinIcon size={13} /> Choose delivery location
          </button>
        )}
      </div>

      <div ref={searchWrapRef} style={{ position: 'relative', marginBottom: 20, maxWidth: 640 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px', background: 'white', borderRadius: 'var(--r-md)', border: '1.5px solid var(--border-1)', height: 48 }}>
          <SearchIcon size={18} color="var(--text-4)" />
          <input type="text" placeholder="Search biryani, pizza, burger..." value={keyword}
            onChange={(e) => { setKeyword(e.target.value); setShowSuggestions(true) }}
            onFocus={() => setShowSuggestions(true)}
            style={{ flex: 1, border: 'none', outline: 'none', font: '400 15px Inter', background: 'transparent' }} />
          {keyword && (
            <button onClick={() => { setKeyword(''); setShowSuggestions(false) }} style={{ color: 'var(--text-4)', cursor: 'pointer' }}>
              <XIcon size={16} />
            </button>
          )}
        </div>
        {showSuggestions && keyword.trim() && suggestions.length > 0 && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', borderRadius: 'var(--r-md)', boxShadow: '0 12px 32px rgba(0,0,0,0.12)', marginTop: 6, zIndex: 50, maxHeight: 360, overflowY: 'auto', border: '1px solid var(--border-1)' }}>
            {suggestions.map((s) => (
              <button key={s.foodId} onMouseDown={(e) => { e.preventDefault(); setKeyword(s.foodName); setShowSuggestions(false) }}
                style={{ width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', borderBottom: '1px solid var(--border-2)', textAlign: 'left', background: 'transparent' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: 'var(--bg-2)' }}>
                  <img src={getImage(s)} alt={s.foodName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.src = pickImage(s.foodId) }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.foodName}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-4)' }}>{formatCurrencyShort(s.price)} · {s.preparationTimeMinutes} min</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', flex: 1, minWidth: 0 }}>
          <button onClick={() => setActiveCategory(null)} style={{ flexShrink: 0, padding: '8px 14px', borderRadius: 9999, border: '1.5px solid var(--border-1)', background: activeCategory === null ? 'var(--gradient-primary)' : 'white', color: activeCategory === null ? 'white' : 'var(--text-2)', font: '600 13px Inter', cursor: 'pointer' }}>All</button>
          {categories.map((c) => (
            <button key={c.categoryId} onClick={() => setActiveCategory(c.categoryId)} style={{ flexShrink: 0, padding: '8px 14px', borderRadius: 9999, border: '1.5px solid var(--border-1)', background: activeCategory === c.categoryId ? 'var(--gradient-primary)' : 'white', color: activeCategory === c.categoryId ? 'white' : 'var(--text-2)', font: '600 13px Inter', cursor: 'pointer' }}>{c.categoryName}</button>
          ))}
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={{ height: 40, padding: '0 12px', border: '1.5px solid var(--border-1)', borderRadius: 'var(--r-md)', font: '500 13px Inter', background: 'white', cursor: 'pointer' }}>
          <option value="ALL">All types</option>
          <option value="VEG">Veg</option>
          <option value="NON_VEG">Non-veg</option>
          <option value="EGG">Egg</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ height: 40, padding: '0 12px', border: '1.5px solid var(--border-1)', borderRadius: 'var(--r-md)', font: '500 13px Inter', background: 'white', cursor: 'pointer' }}>
          <option value="default">Default</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
          <option value="time_asc">Prep time: Fastest</option>
        </select>
      </div>

      {loading ? (
        <Loader />
      ) : displayed.length === 0 ? (
        <EmptyState icon={<UtensilsIcon size={40} />}
          title="No dishes found"
          text={keyword ? `No dishes match "${keyword}"` : 'Try a different category or filter.'}
          action={<Button onClick={() => { setKeyword(''); setActiveCategory(null); setTypeFilter('ALL') }}>Clear filters</Button>} />
      ) : (
        <>
          <div style={{ fontSize: 13, color: 'var(--text-4)', marginBottom: 14 }}>
            {keyword ? <>Found <strong>{displayed.length}</strong> result{displayed.length !== 1 ? 's' : ''} for "{keyword}"</> : <>Showing {displayed.length} of {allFoods.length} dishes</>}
          </div>
          <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
            {displayed.map((food) => {
              const outOfStock = (food.stockQuantity || 0) <= 0
              return (
                <div key={food.foodId} className="card card--hover" style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column', opacity: outOfStock ? 0.75 : 1 }}>
                  <div onClick={() => navigate(`/foods/${food.foodId}`)} style={{ position: 'relative', aspectRatio: '4/3', background: 'var(--bg-2)', overflow: 'hidden' }}>
                    <img src={getImage(food)} alt={food.foodName} loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', filter: outOfStock ? 'grayscale(0.7)' : 'none' }}
                      onError={(e) => { e.currentTarget.src = pickImage(food.foodId) }} />
                    <div style={{ position: 'absolute', top: 12, left: 12, padding: '4px 10px', borderRadius: 9999, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(10px)', fontSize: 11, fontWeight: 700, color: food.foodType === 'VEG' ? '#16A34A' : food.foodType === 'EGG' ? '#CA8A04' : '#DC2626', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      {food.foodType === 'VEG' ? <LeafIcon size={12} /> : <FlameIcon size={12} />}
                      {food.foodType === 'NON_VEG' ? 'Non-veg' : food.foodType}
                    </div>
                    {outOfStock && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,10,15,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ background: 'white', padding: '8px 18px', borderRadius: 9999, fontWeight: 800, fontSize: 13, color: 'var(--danger)', letterSpacing: '0.04em' }}>OUT OF STOCK</div>
                      </div>
                    )}
                  </div>
                  <div style={{ padding: 16, display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div onClick={() => navigate(`/foods/${food.foodId}`)} style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{food.foodName}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-4)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><ClockIcon size={12} /> {food.preparationTimeMinutes} min</span>
                      <span>•</span>
                      <span style={{ color: outOfStock ? 'var(--danger)' : (food.stockQuantity <= 5 ? '#B45309' : 'var(--text-4)'), fontWeight: outOfStock || food.stockQuantity <= 5 ? 700 : 400 }}>
                        {outOfStock ? 'Unavailable' : `${food.stockQuantity} left`}
                      </span>
                    </div>
                    <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 20 }}>{formatCurrencyShort(food.price)}</div>
                      <Button size="sm" disabled={outOfStock} onClick={(e) => { e.stopPropagation(); handleAdd(food) }} loading={adding === food.foodId}>
                        {outOfStock ? 'Sold out' : (<><PlusIcon size={14} /> Add</>)}
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}