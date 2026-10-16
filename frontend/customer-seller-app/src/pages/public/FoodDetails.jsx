import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getFood } from '../../api/foodApi'
import { getSeller } from '../../api/sellerApi'
import { reviewsByFood, foodRating } from '../../api/reviewApi'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import {
  ArrowLeftIcon, ClockIcon, StarIcon, FlameIcon, LeafIcon,
  PlusIcon, MinusIcon, StoreIcon,
} from '../../components/icons'
import { formatCurrency, formatCurrencyShort } from '../../utils/formatCurrency'

const IMG = 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=1000&q=80'

export default function FoodDetails() {
  const { foodId } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, role } = useAuth()
  const { addItem } = useCart()
  const [food, setFood] = useState(null)
  const [seller, setSeller] = useState(null)
  const [reviews, setReviews] = useState([])
  const [rating, setRating] = useState({ averageRating: 0, totalReviews: 0 })
  const [qty, setQty] = useState(1)
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        const f = await getFood(foodId)
        setFood(f)
        const [s, rev, r] = await Promise.all([
          f.sellerId ? getSeller(f.sellerId).catch(() => null) : Promise.resolve(null),
          reviewsByFood(foodId).catch(() => []),
          foodRating(foodId).catch(() => ({ averageRating: 0, totalReviews: 0 })),
        ])
        setSeller(s)
        setReviews(Array.isArray(rev) ? rev : [])
        setRating(r || { averageRating: 0, totalReviews: 0 })
      } catch {
        setFood(null)
      } finally {
        setLoading(false)
      }
    })()
  }, [foodId])

  const handleAdd = async () => {
    if (!isAuthenticated || role !== 'CUSTOMER') {
      toast('Please login to add items to cart')
      navigate('/login')
      return
    }
    setAdding(true)
    try {
      await addItem(food.foodId, qty)
      toast.success('Added to cart')
      navigate('/cart')
    } catch {
      toast.error('Could not add')
    } finally {
      setAdding(false)
    }
  }

  if (loading) return <Loader />

  if (!food) {
    return (
      <div className="page container" style={{ padding: 80, textAlign: 'center' }}>
        <h2>Dish not found</h2>
        <Button style={{ marginTop: 20 }} onClick={() => navigate('/foods')}>
          Browse all food
        </Button>
      </div>
    )
  }

  const avg = Number(rating.averageRating || 0)

  return (
    <div className="page">
      <div className="container" style={{ padding: '24px 24px 60px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 14px',
            borderRadius: 9999,
            background: 'white',
            border: '1px solid var(--border-1)',
            fontSize: 14,
            fontWeight: 600,
            marginBottom: 24,
            cursor: 'pointer',
          }}
        >
          <ArrowLeftIcon size={16} /> Back
        </button>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 40,
            alignItems: 'start',
          }}
        >
          <div
            style={{
              aspectRatio: '4/3',
              borderRadius: 'var(--r-2xl)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)',
              background: 'var(--bg-2)',
            }}
          >
            <img
              src={food.imageUrl || IMG}
              alt={food.foodName}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 12px',
                borderRadius: 9999,
                background:
                  food.foodType === 'VEG'
                    ? '#ECFDF5'
                    : food.foodType === 'EGG'
                    ? '#FEF3C7'
                    : '#FEF2F2',
                color:
                  food.foodType === 'VEG'
                    ? '#16A34A'
                    : food.foodType === 'EGG'
                    ? '#CA8A04'
                    : '#DC2626',
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 16,
              }}
            >
              {food.foodType === 'VEG' ? <LeafIcon size={12} /> : <FlameIcon size={12} />}
              {food.foodType}
            </div>

            <h1 style={{ fontSize: 36, marginBottom: 12, letterSpacing: '-0.03em' }}>
              {food.foodName}
            </h1>

            {seller && (
              <button
                onClick={() => navigate(`/sellers/${seller.sellerId}`)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 12px',
                  borderRadius: 9999,
                  background: 'var(--bg-2)',
                  marginBottom: 16,
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--text-2)',
                  cursor: 'pointer',
                }}
              >
                <StoreIcon size={14} /> {seller.storeName}
              </button>
            )}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                fontSize: 13,
                color: 'var(--text-3)',
                marginBottom: 20,
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <StarIcon size={14} filled />
                <strong>{avg.toFixed(1)}</strong>({rating.totalReviews} reviews)
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <ClockIcon size={14} /> {food.preparationTimeMinutes} min
              </span>
            </div>

            <p
              style={{
                fontSize: 15,
                color: 'var(--text-2)',
                lineHeight: 1.7,
                marginBottom: 28,
              }}
            >
              {food.description || 'Freshly prepared by the seller.'}
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                marginBottom: 28,
              }}
            >
              <span
                style={{
                  fontFamily: 'Plus Jakarta Sans',
                  fontWeight: 800,
                  fontSize: 32,
                  letterSpacing: '-0.02em',
                }}
              >
                {formatCurrency(food.price)}
              </span>
              {food.stockQuantity > 0 ? (
                <span className="badge badge--approved">In stock</span>
              ) : (
                <span className="badge badge--cancelled">Out of stock</span>
              )}
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                marginBottom: 24,
              }}
            >
              <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-2)' }}>
                Quantity
              </span>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '8px 12px',
                  border: '1.5px solid var(--border-1)',
                  borderRadius: 'var(--r-md)',
                  background: 'white',
                }}
              >
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                  disabled={qty <= 1}
                >
                  <MinusIcon size={16} />
                </button>
                <span style={{ fontWeight: 700, minWidth: 24, textAlign: 'center' }}>
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                >
                  <PlusIcon size={16} />
                </button>
              </div>
            </div>

            <Button
              size="lg"
              block
              onClick={handleAdd}
              loading={adding}
              disabled={food.stockQuantity <= 0}
            >
              <PlusIcon size={18} /> Add {qty} · {formatCurrencyShort(food.price * qty)}
            </Button>
          </div>
        </div>

        {reviews.length > 0 && (
          <section style={{ marginTop: 60 }}>
            <h2 style={{ fontSize: 24, marginBottom: 20 }}>Customer reviews</h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: 16,
              }}
            >
              {reviews.map((r) => (
                <div key={r.reviewId} className="card">
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      marginBottom: 8,
                    }}
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <StarIcon key={n} size={14} filled={n <= r.rating} />
                    ))}
                  </div>
                  <p style={{ color: 'var(--text-2)', fontSize: 14 }}>
                    {r.reviewText || 'No comment'}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}