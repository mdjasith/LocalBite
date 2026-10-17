import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useLocation as useRouterLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { listFoods, listCategories } from '../../api/foodApi'
import { getNearbySellers } from '../../api/locationApi'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useLocation } from '../../context/LocationContext'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import EmptyState from '../../components/common/EmptyState'
import { SearchIcon, ClockIcon, PlusIcon, FlameIcon, LeafIcon, UtensilsIcon, XIcon, MapPinIcon } from '../../components/icons'
import { formatCurrencyShort } from '../../utils/formatCurrency'

const IMG_POOL = ['https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80','https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&q=80','https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&q=80']
function pickImage(seed) { return IMG_POOL[Number(String(seed).split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % IMG_POOL.length] }

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
  const [activeCategory, setActiveCategory] = useState(null)
  const [adding, setAdding] = useState(null)

  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        const f = await listFoods().catch(() => [])
        const c = await listCategories().catch(() => [])
        
        let foods = Array.isArray(f) ? f : []
        
        // BUG FIX: Filter by 10km radius
        if (hasLocation && location.latitude && location.longitude) {
          const nearby = await getNearbySellers(location.latitude, location.longitude, 10).catch(() => [])
          const validSellers = nearby.map(s => s.sellerId)
          foods = foods.filter(food => validSellers.includes(food.sellerId))
        }

        setAllFoods(foods)
        setCategories(Array.isArray(c) ? c : [])
      } finally { setLoading(false) }
    })()
  }, [hasLocation, location])

  const displayed = useMemo(() => {
    let list = [...allFoods]
    if (keyword.trim()) {
      const q = keyword.toLowerCase().trim()
      list = list.filter((f) => (f.foodName && f.foodName.toLowerCase().includes(q)))
    }
    if (activeCategory) list = list.filter((f) => f.categoryId === activeCategory)
    return list
  }, [allFoods, keyword, activeCategory])

  const handleAdd = async (food) => {
    if (!isAuthenticated || role !== 'CUSTOMER') {
      toast('Please login to add items to cart')
      navigate('/login', { state: { from: routerLocation } })
      return
    }
    setAdding(food.foodId)
    try { await addItem(food.foodId, 1); toast.success('Added to cart') } 
    catch (e) { toast.error(e?.response?.data?.message || 'Could not add') } 
    finally { setAdding(null) }
  }

  return (
    <div className="page container" style={{ padding: '32px 16px 80px' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 28, marginBottom: 6 }}>Browse dishes</h1>
        {hasLocation ? (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-3)' }}>
            <MapPinIcon size={13} /> Delivering to <strong>{location.address}</strong>
          </div>
        ) : (
          <button onClick={() => navigate('/customer/location')} style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>Choose delivery location</button>
        )}
      </div>

      <div style={{ marginBottom: 20, maxWidth: 640 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px', background: 'white', borderRadius: 'var(--r-md)', border: '1.5px solid var(--border-1)', height: 48 }}>
          <SearchIcon size={18} color="var(--text-4)" />
          <input type="text" placeholder="Search biryani, pizza..." value={keyword} onChange={(e) => setKeyword(e.target.value)} style={{ flex: 1, border: 'none', outline: 'none' }} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 20 }}>
        <button onClick={() => setActiveCategory(null)} style={{ padding: '8px 14px', borderRadius: 9999, background: activeCategory === null ? 'var(--gradient-primary)' : 'white', color: activeCategory === null ? 'white' : 'var(--text-2)', border: '1.5px solid var(--border-1)' }}>All</button>
        {categories.map((c) => (
          <button key={c.categoryId} onClick={() => setActiveCategory(c.categoryId)} style={{ padding: '8px 14px', borderRadius: 9999, background: activeCategory === c.categoryId ? 'var(--gradient-primary)' : 'white', color: activeCategory === c.categoryId ? 'white' : 'var(--text-2)', border: '1.5px solid var(--border-1)' }}>{c.categoryName}</button>
        ))}
      </div>

      {loading ? <Loader /> : displayed.length === 0 ? (
        <EmptyState icon={<UtensilsIcon size={40} />} title="No dishes found" text={!hasLocation ? "Please select a location to see food nearby." : "No dishes match your search."} />
      ) : (
        <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
          {displayed.map((food) => (
            <div key={food.foodId} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div onClick={() => navigate(`/foods/${food.foodId}`)} style={{ aspectRatio: '4/3', overflow: 'hidden' }}>
                <img src={food.imageUrl || pickImage(food.foodId)} alt={food.foodName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: 16, display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{food.foodName}</div>
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 800, fontSize: 20 }}>{formatCurrencyShort(food.price)}</div>
                  <Button size="sm" onClick={() => handleAdd(food)} loading={adding === food.foodId}><PlusIcon size={14} /> Add</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}