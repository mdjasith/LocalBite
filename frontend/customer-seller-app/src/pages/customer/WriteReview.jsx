import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getOrder } from '../../api/orderApi'
import { createReview } from '../../api/reviewApi'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import Input from '../../components/common/Input'
import {
  ArrowLeftIcon, StarIcon, CheckCircleIcon,
} from '../../components/icons'
import { extractError } from '../../api/axiosClient'

export default function WriteReview() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  // ratings keyed by foodId
  const [ratings, setRatings] = useState({})
  const [comments, setComments] = useState({})

  useEffect(() => {
    ;(async () => {
      try {
        const o = await getOrder(orderId)
        if (o.orderStatus !== 'DELIVERED') {
          toast.error('You can only review delivered orders')
          navigate(`/orders/${orderId}`)
          return
        }
        setOrder(o)
        const initialRatings = {}
        const initialComments = {}
        ;(o.items || []).forEach((it) => {
          initialRatings[it.foodId] = 5
          initialComments[it.foodId] = ''
        })
        setRatings(initialRatings)
        setComments(initialComments)
      } catch {
        toast.error('Order not found')
        navigate('/orders')
      } finally {
        setLoading(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId])

  const handleRating = (foodId, value) => {
    setRatings({ ...ratings, [foodId]: value })
  }

  const handleComment = (foodId, value) => {
    setComments({ ...comments, [foodId]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const items = order.items || []
      let successCount = 0
      let alreadyReviewed = 0
      for (const item of items) {
        try {
          await createReview({
            orderId: order.orderId,
            sellerId: order.sellerId,
            foodId: item.foodId,
            rating: ratings[item.foodId] || 5,
            reviewText: comments[item.foodId] || '',
          })
          successCount++
        } catch (err) {
          const msg = extractError(err)
          if (msg.toLowerCase().includes('already reviewed')) {
            alreadyReviewed++
          } else {
            throw err
          }
        }
      }
      if (successCount > 0) {
        toast.success(`Posted ${successCount} review${successCount > 1 ? 's' : ''}`)
      } else if (alreadyReviewed > 0) {
        toast('You already reviewed these items')
      }
      navigate(`/orders/${orderId}`)
    } catch (err) {
      toast.error(extractError(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Loader />
  if (!order) return null

  const isSuccess = location.state?.success

  return (
    <div className="page container" style={{ padding: '24px 24px 80px', maxWidth: 720 }}>
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

      <h1 style={{ fontSize: 32, marginBottom: 8 }}>Rate your order</h1>
      <p style={{ color: 'var(--text-3)', fontSize: 15, marginBottom: 32 }}>
        Order #LB{order.orderId} · Help others by sharing your experience.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {(order.items || []).map((item) => (
          <div key={item.orderItemId} className="card" style={{ padding: 24 }}>
            <div
              style={{
                fontFamily: 'Plus Jakarta Sans',
                fontWeight: 700,
                fontSize: 18,
                marginBottom: 6,
              }}
            >
              {item.foodName}
            </div>
            <div
              style={{
                fontSize: 13,
                color: 'var(--text-4)',
                marginBottom: 16,
              }}
            >
              {item.quantity} × {`₹${item.pricePerItem}`}
            </div>

            <label
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--text-3)',
                marginBottom: 8,
                display: 'block',
              }}
            >
              Your rating
            </label>
            <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => handleRating(item.foodId, n)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  <StarIcon
                    size={36}
                    filled={n <= (ratings[item.foodId] || 5)}
                  />
                </button>
              ))}
            </div>

            <Input
              label="Comment (optional)"
              as="textarea"
              rows={3}
              placeholder="Tell us about the taste, quantity, delivery..."
              value={comments[item.foodId] || ''}
              onChange={(e) => handleComment(item.foodId, e.target.value)}
            />
          </div>
        ))}

        <Button type="submit" size="lg" block loading={submitting}>
          <CheckCircleIcon size={18} /> Submit review
        </Button>
      </form>
    </div>
  )
}