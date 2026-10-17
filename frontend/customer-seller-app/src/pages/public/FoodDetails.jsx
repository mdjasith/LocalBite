import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation as useRouterLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getFood, listFoodsBySeller } from '../../api/foodApi'
import { reviewsByFood, foodRatingSummary } from '../../api/reviewApi'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import { StarIcon, ClockIcon, ArrowLeftIcon, FlameIcon, LeafIcon, PlusIcon, ShieldIcon } from '../../components/icons'
import { formatCurrency } from '../../utils/formatCurrency'

export default function FoodDetails() {
  const { foodId } = useParams()
  const navigate = useNavigate()
  const routerLocation = useRouterLocation()
  const { isAuthenticated, role } = useAuth()
  const { addItem } = useCart()
  
  const [food, setFood] = useState(null)
  const [reviews, setReviews] = useState([])
  const [rating, setRating] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        const f = await getFood(foodId)
        setFood(f)
        
        reviewsByFood(foodId).then((r) => setReviews(Array.isArray(r) ? r : [])).catch(() => {})
        foodRatingSummary(foodId).then(setRating).catch(() => {})
        
        if (f.sellerId) {
          listFoodsBySeller(f.sellerId).then((s) => {
            setSuggestions(s.filter(item => item.foodId !== Number(foodId)).slice(0, 4))
          }).catch(() => {})
        }
      } catch { toast.error('Food not found'); navigate('/foods') } 
      finally { setLoading(false) }
    })()
  }, [foodId, navigate])

  const handleAdd = async () => {
    if (!isAuthenticated || role !== 'CUSTOMER') {
      navigate('/login', { state: { from: routerLocation } })
      return
    }
    setAdding(true)
    try { await addItem(food.foodId, 1); toast.success('Added to cart') } 
    catch (e) { toast.error(e?.response?.data?.message || 'Could not add') } 
    finally { setAdding(false) }
  }

  if (loading) return <Loader />
  if (!food) return null

  return (
    <div className="page container" style={{ padding: '24px 16px 80px', maxWidth: 900 }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: 20, display: 'inline-flex', alignItems: 'center', gap: 8 }}><ArrowLeftIcon size={16} /> Back</button>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: 32 }}>
        <div style={{ borderRadius: 16, overflow: 'hidden', aspectRatio: '4/3', background: 'var(--bg-2)' }}>
          <img src={food.imageUrl} alt={food.foodName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <div className={`badge badge--${food.foodType === 'VEG' ? 'approved' : 'blocked'}`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {food.foodType === 'VEG' ? <LeafIcon size={12} /> : <FlameIcon size={12} />} {food.foodType}
            </div>
          </div>
          <h1 style={{ fontSize: 32, marginBottom: 8 }}>{food.foodName}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, fontSize: 14 }}>
            {rating && <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}><StarIcon size={16} filled /> {rating.averageRating || 'New'}</span>}
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><ClockIcon size={16} /> {food.preparationTimeMinutes} mins</span>
          </div>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--text-2)', marginBottom: 24 }}>{food.description}</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-1)', paddingTop: 24, gap: 16 }}>
            <div style={{ fontSize: 32, fontWeight: 800 }}>{formatCurrency(food.price)}</div>
            <Button size="lg" onClick={handleAdd} loading={adding}><PlusIcon size={18} /> Add to Cart</Button>
          </div>
        </div>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div style={{ marginTop: 48 }}>
          <h2 style={{ fontSize: 24, marginBottom: 20 }}>More from this seller</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {suggestions.map(s => (
              <div key={s.foodId} className="card" onClick={() => navigate(`/foods/${s.foodId}`)} style={{ padding: 12, cursor: 'pointer' }}>
                <div style={{ aspectRatio: '4/3', borderRadius: 8, overflow: 'hidden', marginBottom: 12 }}>
                  <img src={s.imageUrl} alt={s.foodName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{s.foodName}</div>
                <div style={{ fontWeight: 800, marginTop: 4 }}>{formatCurrency(s.price)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      <div style={{ marginTop: 48, borderTop: '1px solid var(--border-1)', paddingTop: 32 }}>
        <h2 style={{ fontSize: 24, marginBottom: 20 }}>Customer Reviews</h2>
        {reviews.length === 0 ? (
          <p style={{ color: 'var(--text-3)' }}>No reviews yet for this dish.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {reviews.map((r, i) => (
              <div key={i} style={{ background: 'var(--bg-2)', padding: 16, borderRadius: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ fontWeight: 700 }}>{r.customerName || 'Customer'}</div>
                  <div style={{ display: 'flex', color: '#F59E0B' }}>
                    {[...Array(5)].map((_, j) => <StarIcon key={j} size={14} filled={j < r.rating} />)}
                  </div>
                </div>
                <p style={{ fontSize: 14, color: 'var(--text-2)', margin: 0 }}>{r.reviewText}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}