import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { myOrders, updateOrderStatus } from '../../api/orderApi'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import EmptyState from '../../components/common/EmptyState'
import Badge from '../../components/common/Badge'
import { PackageIcon, ArrowRightIcon, RefreshIcon } from '../../components/icons'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDateTime } from '../../utils/formatDate'
import { extractError } from '../../api/axiosClient'

const NEXT_STATUS = {
  PLACED: { next: 'ACCEPTED', label: 'Accept order' },
  ACCEPTED: { next: 'PREPARING', label: 'Mark preparing' },
  PREPARING: { next: 'READY', label: 'Mark ready' },
  READY: { next: 'OUT_FOR_DELIVERY', label: 'Out for delivery' },
}

const FILTERS = [
  { id: 'active', label: 'Active' },
  { id: 'pending', label: 'Pending' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'all', label: 'All' },
]

export default function SellerOrders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('active')

  const load = async () => {
    try {
      setLoading(true)
      const data = await myOrders()
      setOrders(Array.isArray(data) ? data : [])
    } catch {
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleAdvance = async (orderId, next) => {
    try {
      await updateOrderStatus(orderId, next)
      toast.success('Status updated')
      load()
    } catch (err) {
      toast.error(extractError(err))
    }
  }

  const filtered = orders.filter((o) => {
    if (filter === 'active')
      return ['PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY'].includes(
        o.orderStatus
      )
    if (filter === 'pending') return o.orderStatus === 'PLACED'
    if (filter === 'delivered') return o.orderStatus === 'DELIVERED'
    return true
  })

  return (
    <div className="page container" style={{ padding: '40px 24px 80px', maxWidth: 900 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
        }}
      >
        <h1 style={{ fontSize: 32 }}>Orders</h1>
        <Button variant="outline" onClick={load} loading={loading}>
          <RefreshIcon size={16} /> Refresh
        </Button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            style={{
              padding: '8px 16px',
              borderRadius: 9999,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              border: '1.5px solid var(--border-1)',
              background: filter === f.id ? 'var(--gradient-primary)' : 'white',
              color: filter === f.id ? 'white' : 'var(--text-2)',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<PackageIcon size={40} />}
          title="No orders"
          text="Orders will appear here when customers order from you."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map((o) => {
            const nextStep = NEXT_STATUS[o.orderStatus]
            return (
              <div key={o.orderId} className="card" style={{ padding: 24 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 16,
                    marginBottom: 16,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontFamily: 'Plus Jakarta Sans',
                        fontWeight: 800,
                        fontSize: 20,
                        marginBottom: 4,
                      }}
                    >
                      Order #LB{o.orderId}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-4)' }}>
                      {formatDateTime(o.createdAt)}
                    </div>
                  </div>
                  <Badge
                    status={o.orderStatus}
                    dot={[
                      'PLACED',
                      'ACCEPTED',
                      'PREPARING',
                      'READY',
                      'OUT_FOR_DELIVERY',
                    ].includes(o.orderStatus)}
                  >
                    {o.orderStatus.replace(/_/g, ' ')}
                  </Badge>
                </div>

                <div
                  style={{
                    paddingTop: 12,
                    borderTop: '1px solid var(--border-2)',
                    marginBottom: 16,
                    fontSize: 14,
                  }}
                >
                  {o.items?.map((it) => (
                    <div
                      key={it.orderItemId}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 6,
                        color: 'var(--text-2)',
                      }}
                    >
                      <span>
                        {it.foodName} × {it.quantity}
                      </span>
                      <span style={{ fontWeight: 600 }}>
                        {formatCurrency(it.totalPrice)}
                      </span>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: 12,
                    borderTop: '1px solid var(--border-2)',
                    gap: 12,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-4)' }}>
                      Total
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 20 }}>
                      {formatCurrency(o.totalAmount)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {nextStep && (
                      <Button
                        size="sm"
                        onClick={() => handleAdvance(o.orderId, nextStep.next)}
                      >
                        {nextStep.label}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/seller/orders/${o.orderId}`)}
                    >
                      View <ArrowRightIcon size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}