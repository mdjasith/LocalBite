import { useEffect, useState } from 'react'
import { useSeller } from '../../context/SellerContext'
import { reviewsBySeller, sellerRating } from '../../api/reviewApi'
import Loader from '../../components/common/Loader'
import EmptyState from '../../components/common/EmptyState'
import { StarIcon } from '../../components/icons'
import { formatDate } from '../../utils/formatDate'

export default function SellerReviews() {
  const { seller } = useSeller()
  const [reviews, setReviews] = useState([])
  const [summary, setSummary] = useState({ averageRating: 0, totalReviews: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      if (!seller) return
      try {
        const [list, s] = await Promise.all([
          reviewsBySeller(seller.sellerId).catch(() => []),
          sellerRating(seller.sellerId).catch(() => ({ averageRating: 0, totalReviews: 0 })),
        ])
        setReviews(Array.isArray(list) ? list : [])
        setSummary(s)
      } finally {
        setLoading(false)
      }
    })()
  }, [seller])

  if (loading) return <Loader />

  return (
    <div className="page container" style={{ padding: '40px 24px 80px', maxWidth: 900 }}>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>Customer reviews</h1>
      <p style={{ color: 'var(--text-3)', fontSize: 15, marginBottom: 32 }}>
        What customers are saying about you.
      </p>

      <div className="card" style={{ padding: 28, marginBottom: 32 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 32,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div
              style={{
                fontFamily: 'Plus Jakarta Sans',
                fontWeight: 800,
                fontSize: 56,
                lineHeight: 1,
                letterSpacing: '-0.03em',
              }}
            >
              {Number(summary.averageRating || 0).toFixed(1)}
            </div>
            <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <StarIcon
                  key={n}
                  size={18}
                  filled={n <= Math.round(summary.averageRating || 0)}
                />
              ))}
            </div>
            <div
              style={{
                fontSize: 13,
                color: 'var(--text-4)',
                marginTop: 6,
              }}
            >
              {summary.totalReviews} review{summary.totalReviews !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      {reviews.length === 0 ? (
        <EmptyState
          icon={<StarIcon size={40} />}
          title="No reviews yet"
          text="Customer reviews will show up here."
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 16,
          }}
        >
          {reviews.map((r) => (
            <div key={r.reviewId} className="card" style={{ padding: 20 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 10,
                }}
              >
                <div style={{ display: 'flex', gap: 4 }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <StarIcon key={n} size={14} filled={n <= r.rating} />
                  ))}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-4)' }}>
                  {formatDate(r.createdAt)}
                </div>
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6 }}>
                {r.reviewText || 'No comment'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}