import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { myOrders } from '../../api/orderApi'
import { useCart } from '../../context/CartContext'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import EmptyState from '../../components/common/EmptyState'
import Badge from '../../components/common/Badge'
import { PackageIcon, ArrowRightIcon, ClockIcon, StoreIcon, RefreshIcon } from '../../components/icons'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDateTime } from '../../utils/formatDate'

const STATUS_LABEL = {
  PLACED: 'Order placed',
  ACCEPTED: 'Accepted',
  PREPARING: 'Preparing',
  READY: 'Ready',
  OUT_FOR_DELIVERY: 'Out for delivery',
  OTP_VERIFICATION: 'Verifying',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  FAILED: 'Failed',
}

export default function Orders() {
  const navigate = useNavigate()
  const { addItem } = useCart()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [reordering, setReordering] = useState(null)

  useEffect(() => {
    ;(async () => {
      try {
        const data = await myOrders()
        setOrders(Array.isArray(data) ? data : [])
      } catch {
        setOrders([])
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const handleReorder = async (order) => {
    setReordering(order.orderId)
    try {
      for (const item of order.items || []) {
        try {
          await addItem(item.foodId, item.quantity)
        } catch {
          // item might be unavailable; skip
        }
      }
      toast.success('Items added to cart')
      navigate('/cart')
    } catch {
      toast.error('Could not reorder')
    } finally {
      setReordering(null)
    }
  }

  if (loading) return <Loader />

  if (orders.length === 0) {
    return (
      <div className="page container" style={{ padding: '80px 24px' }}>
        <EmptyState
          icon={<PackageIcon size={40} />}
          title="No orders yet"
          text="Your orders will appear here after you place one."
          action={<Button onClick={() => navigate('/foods')}>Browse food <ArrowRightIcon size={16} /></Button>}
        />
      </div>
    )
  }

  const sortKey = (o) => (['DELIVERED', 'CANCELLED', 'FAILED'].includes(o.orderStatus) ? 1 : 0)
  const sorted = [...orders].sort((a, b) => sortKey(a) - sortKey(b))

  return (
    <div className="page container" style={{ padding: '40px 24px 80px', maxWidth: 900 }}>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>My orders</h1>
      <p style={{ color: 'var(--text-3)', fontSize: 15, marginBottom: 32 }}>
        {orders.length} order{orders.length !== 1 ? 's' : ''} total
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {sorted.map((o) => (
          <div
            key={o.orderId}
            className="card"
            style={{ cursor: 'pointer', padding: 24 }}
            onClick={() => navigate(`/orders/${o.orderId}`)}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}>
              <div>
                <div style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 20, marginBottom: 4 }}>
                  Order #LB{o.orderId}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-4)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ClockIcon size={12} /> {formatDateTime(o.createdAt)}
                </div>
              </div>
              <Badge
                status={o.orderStatus}
                dot={['PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY'].includes(o.orderStatus)}
              >
                {STATUS_LABEL[o.orderStatus] || o.orderStatus}
              </Badge>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0', borderTop: '1px solid var(--border-2)', fontSize: 13, color: 'var(--text-3)' }}>
              <StoreIcon size={14} />
              <span>Seller #{o.sellerId}</span>
              <span style={{ marginLeft: 'auto', color: 'var(--text-4)' }}>
                {o.items?.length || 0} item{o.items?.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-4)', marginBottom: 2 }}>Total paid</div>
                <div style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 22 }}>
                  {formatCurrency(o.totalAmount)}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {o.orderStatus === 'DELIVERED' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleReorder(o)
                    }}
                    loading={reordering === o.orderId}
                  >
                    <RefreshIcon size={14} /> Reorder
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(`/orders/${o.orderId}`)
                  }}
                >
                  View <ArrowRightIcon size={14} />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}