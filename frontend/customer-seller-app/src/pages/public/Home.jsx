import { useEffect, useState } from 'react'
import { useNavigate, useLocation as useRouterLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { listFoods, listCategories } from '../../api/foodApi'
import { listSellers } from '../../api/sellerApi'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { fetchFoodImageWithFallbacks } from '../../utils/foodImageApi'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import {
  StarIcon, ClockIcon, PlusIcon, ArrowRightIcon, StoreIcon, FlameIcon,
  LeafIcon, UtensilsIcon,
} from '../../components/icons'
import { formatCurrencyShort } from '../../utils/formatCurrency'

const IMG_POOL = [
  'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80',
  'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&q=80',
  'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&q=80',
  'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&q=80',
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80',
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
  'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80',
  'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&q=80',
]

function pickImage(seed) {
  const idx = Number(String(seed || '0').split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % IMG_POOL.length
  return IMG_POOL[idx]
}

export default function Home() {
  const navigate = useNavigate()
  const routerLocation = useRouterLocation()
  const { isAuthenticated, role } = useAuth()
  const { addItem } = useCart()

  const [foods, setFoods] = useState([])
  const [sellers, setSellers] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState(null)
  const [adding, setAdding] = useState(null)
  const [realImages, setRealImages] = useState({})

  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        const [f, s, c] = await Promise.all([
          listFoods().catch(() => []),
          listSellers().catch(() => []),
          listCategories().catch(() => []),
        ])
        setFoods(Array.isArray(f) ? f : [])
        setSellers(Array.isArray(s) ? s : [])
        setCategories(Array.isArray(c) ? c : [])
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  // Load real images for first 12 dishes (browser-safe)
  useEffect(() => {
    if (!foods.length) return
    let cancelled = false
    ;(async () => {
      for (const food of foods.slice(0, 12)) {
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
  }, [foods])

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

  const filtered = activeCategory ? foods.filter((f) => f.categoryId === activeCategory) : foods

  return (
    <div className="page">
      <section style={{ position: 'relative', padding: '72px 24px 56px', overflow: 'hidden', background: 'linear-gradient(180deg, #FFF5F0 0%, #FAFAFB 100%)' }}>
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,92,57,0.25), transparent 70%)', filter: 'blur(90px)', top: -150, left: -150, animation: 'floatSlow 12s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.20), transparent 70%)', filter: 'blur(90px)', bottom: -150, right: -150, animation: 'floatSlow 14s ease-in-out infinite reverse' }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 720 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: 'white', borderRadius: 9999, boxShadow: 'var(--shadow-sm)', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 24, border: '1px solid var(--border-2)' }}>
              <FlameIcon size={14} style={{ color: '#FF5C39' }} />
              {foods.length} dishes available now
            </div>
            <h1 style={{ fontSize: 'clamp(34px, 5vw, 56px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: 18 }}>
              Order from <span className="gradient-text-aurora">local sellers</span><br />near you.
            </h1>
            <p style={{ fontSize: 17, color: 'var(--text-3)', marginBottom: 32, maxWidth: 560, lineHeight: 1.6 }}>
              Discover food from sellers within 10 km. Browse freely — login only when you add to cart.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Button size="lg" onClick={() => navigate('/foods')}>Browse all food <ArrowRightIcon size={18} /></Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/sellers')}><StoreIcon size={18} /> View sellers</Button>
            </div>
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="container" style={{ padding: '40px 24px 12px' }}>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
            <button onClick={() => setActiveCategory(null)} style={{ flexShrink: 0, padding: '10px 20px', borderRadius: 9999, border: '1.5px solid var(--border-1)', background: activeCategory === null ? 'var(--gradient-primary)' : 'white', color: activeCategory === null ? 'white' : 'var(--text-2)', font: '600 14px Inter', boxShadow: activeCategory === null ? 'var(--shadow-brand)' : 'none', cursor: 'pointer' }}>All</button>
            {categories.map((c) => (
              <button key={c.categoryId} onClick={() => setActiveCategory(c.categoryId)} style={{ flexShrink: 0, padding: '10px 20px', borderRadius: 9999, border: '1.5px solid var(--border-1)', background: activeCategory === c.categoryId ? 'var(--gradient-primary)' : 'white', color: activeCategory === c.categoryId ? 'white' : 'var(--text-2)', font: '600 14px Inter', boxShadow: activeCategory === c.categoryId ? 'var(--shadow-brand)' : 'none', cursor: 'pointer' }}>{c.categoryName}</button>
            ))}
          </div>
        </section>
      )}

      {sellers.length > 0 && (
        <section className="container" style={{ padding: '32px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontSize: 24 }}>Featured sellers</h2>
            <button onClick={() => navigate('/sellers')} style={{ color: 'var(--brand-primary)', fontWeight: 600, fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>See all <ArrowRightIcon size={14} /></button>
          </div>
          <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {sellers.slice(0, 6).map((s) => (
              <div key={s.sellerId} className="card card--hover" onClick={() => navigate(`/sellers/${s.sellerId}`)} style={{ cursor: 'pointer', padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--gradient-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 20, fontFamily: 'Plus Jakarta Sans', flexShrink: 0 }}>{s.storeName?.[0] || 'S'}</div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.storeName}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-4)' }}>{s.ownerName}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--text-3)' }}><StarIcon size={14} filled /> 4.5</span>
                  <span className={`badge badge--${(s.operatingStatus || '').toLowerCase()}`}>{s.operatingStatus || 'CLOSED'}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="container" style={{ padding: '32px 24px 60px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 24 }}>{activeCategory ? 'Matching dishes' : 'Popular near you'}</h2>
          <button onClick={() => navigate('/foods')} style={{ color: 'var(--brand-primary)', fontWeight: 600, fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>See all <ArrowRightIcon size={14} /></button>
        </div>

        {loading ? (
          <Loader />
        ) : filtered.length === 0 ? (
          <div className="card" style={{ padding: 60, textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--brand-primary-light)', color: 'var(--brand-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <UtensilsIcon size={32} />
            </div>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 6 }}>No dishes yet</div>
            <div style={{ color: 'var(--text-3)', fontSize: 14 }}>Sellers are adding items. Check back soon.</div>
          </div>
        ) : (
          <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
            {filtered.slice(0, 12).map((food) => {
              const outOfStock = (food.stockQuantity || 0) <= 0
              const lowStock = !outOfStock && food.stockQuantity <= 5
              return (
                <div key={food.foodId} className="card card--hover" style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column', opacity: outOfStock ? 0.75 : 1 }}>
                  <div onClick={() => navigate(`/foods/${food.foodId}`)} style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', background: 'var(--bg-2)' }}>
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
                      <span style={{ color: outOfStock ? 'var(--danger)' : lowStock ? '#B45309' : 'var(--text-4)', fontWeight: outOfStock || lowStock ? 700 : 400 }}>
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
        )}
      </section>

      <section style={{ padding: '80px 24px', background: 'linear-gradient(180deg, #FAFAFB 0%, #FFF5F0 100%)' }}>
        <div className="container" style={{ maxWidth: 800, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: 'white', borderRadius: 9999, boxShadow: 'var(--shadow-sm)', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 20, border: '1px solid var(--border-2)' }}>About this project</div>
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 34px)', marginBottom: 16, letterSpacing: '-0.03em' }}>What is LocalBite?</h2>
          <p style={{ color: 'var(--text-3)', fontSize: 16, lineHeight: 1.7, marginBottom: 28 }}>
            LocalBite is a <strong style={{ color: 'var(--text-1)' }}>personal full-stack portfolio project</strong> — not a real food delivery service. It demonstrates how a multi-vendor food marketplace works with 16 microservices, JWT security, geospatial search, simulated payments, and OTP-verified delivery.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, marginBottom: 32, maxWidth: 640, margin: '0 auto 32px' }}>
            {[
              { n: '16', label: 'Microservices' },
              { n: '10 km', label: 'Geo search' },
              { n: '100%', label: 'Simulated' },
            ].map((s) => (
              <div key={s.label} className="card" style={{ padding: 20 }}>
                <div className="gradient-text-aurora" style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 24, letterSpacing: '-0.02em', marginBottom: 4 }}>{s.n}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
              </div>
            ))}
          </div>
          <Button size="lg" variant="outline" onClick={() => navigate('/about')}>Learn more about the project <ArrowRightIcon size={18} /></Button>
        </div>
      </section>
    </div>
  )
}