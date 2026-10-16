import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getSeller, getSellerLocation } from '../../api/sellerApi'
import { foodsBySeller } from '../../api/foodApi'
import { reviewsBySeller, sellerRating } from '../../api/reviewApi'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import {
  ArrowLeftIcon, StarIcon, PlusIcon, ClockIcon, MapPinIcon,
} from '../../components/icons'
import { formatCurrencyShort } from '../../utils/formatCurrency'

const IMG_POOL = [
  'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80',
  'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&q=80',
  'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&q=80',
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80',
]

function pickImage(seed) {
  const idx =
    Number(String(seed || '0').split('').reduce((a, c) => a + c.charCodeAt(0), 0)) %
    IMG_POOL.length
  return IMG_POOL[idx]
}

export default function SellerDetails() {
  const { sellerId } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, role } = useAuth()
  const { addItem } = useCart()
  const [seller, setSeller] = useState(null)
  const [location, setLocation] = useState(null)
  const [foods, setFoods] = useState([])
  const [reviews, setReviews] = useState([])
  const [rating, setRating] = useState({ averageRating: 0, totalReviews: 0 })
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(null)

  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        const s = await getSeller(sellerId)
        setSeller(s)
        const [loc, f, rev, r] = await Promise.all([
          getSellerLocation(sellerId).catch(() => null),
          foodsBySeller(sellerId).catch(() => []),
          reviewsBySeller(sellerId).catch(() => []),
          sellerRating(sellerId).catch(() => ({ averageRating: 0, totalReviews: 0 })),
        ])
        setLocation(loc)
        setFoods(Array.isArray(f) ? f : [])
        setReviews(Array.isArray(rev) ? rev : [])
        setRating(r || { averageRating: 0, totalReviews: 0 })
      } catch {
        setSeller(null)
      } finally {
        setLoading(false)
      }
    })()
  }, [sellerId])

  const handleAdd = async (food) => {
    if (!isAuthenticated || role !== 'CUSTOMER') {
      toast('Please login to add items to cart')
      navigate('/login')
      return
    }
    setAdding(food.foodId)
    try {
      await addItem(food.foodId, 1)
      toast.success('Added to cart')
    } catch {
      toast.error('Could not add')
    } finally {
      setAdding(null)
    }
  }

  if (loading) return <Loader />

  if (!seller) {
    return (
      <div className="page container" style={{ padding: 80, textAlign: 'center' }}>
        <h2>Seller not found</h2>
        <Button style={{ marginTop: 20 }} onClick={() => navigate('/sellers')}>
          Back to sellers
        </Button>
      </div>
    )
  }

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
          className="card"
          style={{
            padding: 32,
            marginBottom: 32,
            background: 'linear-gradient(135deg, #FFF5F0 0%, white 100%)',
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: 20,
              background: 'var(--gradient-primary)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 36,
              fontFamily: 'Plus Jakarta Sans',
              boxShadow: 'var(--shadow-brand)',
            }}
          >
            {seller.storeName?.[0] || 'S'}
          </div>

          <div style={{ flex: 1, minWidth: 200 }}>
            <h1 style={{ fontSize: 28, marginBottom: 6 }}>{seller.storeName}</h1>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                fontSize: 13,
                color: 'var(--text-3)',
                flexWrap: 'wrap',
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <StarIcon size={14} filled />
                <strong style={{ color: 'var(--text-1)' }}>
                  {Number(rating.averageRating || 0).toFixed(1)}
                </strong>({rating.totalReviews})
              </span>
              {location && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <MapPinIcon size={14} /> {location.city}
                </span>
              )}
              <span className={`badge badge--${(seller.operatingStatus || '').toLowerCase()}`}>
                {seller.operatingStatus || 'CLOSED'}
              </span>
            </div>
            {seller.storeDescription && (
              <p
                style={{
                  fontSize: 14,
                  color: 'var(--text-2)',
                  marginTop: 12,
                  lineHeight: 1.6,
                }}
              >
                {seller.storeDescription}
              </p>
            )}
          </div>
        </div>

        <div style={{ marginBottom: 60 }}>
          <h2 style={{ fontSize: 22, marginBottom: 20 }}>Menu</h2>
          {foods.length === 0 ? (
            <div className="card" style={{ padding: 40, textAlign: 'center' }}>
              <p style={{ color: 'var(--text-3)' }}>No dishes available right now.</p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: 16,
              }}
            >
              {foods.map((food) => (
                <div
                  key={food.foodId}
                  className="card card--hover"
                  style={{ padding: 0, overflow: 'hidden' }}
                >
                  <div
                    onClick={() => navigate(`/foods/${food.foodId}`)}
                    style={{
                      aspectRatio: '4/3',
                      background: 'var(--bg-2)',
                      cursor: 'pointer',
                      overflow: 'hidden',
                    }}
                  >
                    <img
                      src={food.imageUrl || pickImage(food.foodId)}
                      alt={food.foodName}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ padding: 16 }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 14,
                        marginBottom: 4,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {food.foodName}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: 'var(--text-4)',
                        marginBottom: 12,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <ClockIcon size={12} /> {food.preparationTimeMinutes} min
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'Plus Jakarta Sans',
                          fontWeight: 800,
                          fontSize: 18,
                        }}
                      >
                        {formatCurrencyShort(food.price)}
                      </span>
                      <Button
                        size="sm"
                        onClick={() => handleAdd(food)}
                        loading={adding === food.foodId}
                      >
                        <PlusIcon size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {reviews.length > 0 && (
          <div>
            <h2 style={{ fontSize: 22, marginBottom: 20 }}>Reviews</h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 16,
              }}
            >
              {reviews.map((r) => (
                <div key={r.reviewId} className="card">
                  <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <StarIcon key={n} size={14} filled={n <= r.rating} />
                    ))}
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--text-2)' }}>
                    {r.reviewText || 'No comment'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}