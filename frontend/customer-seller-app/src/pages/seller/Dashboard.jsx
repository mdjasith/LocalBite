import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useSeller } from '../../context/SellerContext'
import { myOrders, updateOrderStatus } from '../../api/orderApi'
import { mySummary } from '../../api/commissionApi'
import { updateOperatingStatus, getSellerLocation } from '../../api/sellerApi'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import Badge from '../../components/common/Badge'
import {
  StoreIcon, PackageIcon, DollarSignIcon, TrendingUpIcon, ClockIcon,
  MapPinIcon, ArrowRightIcon, CheckIcon, RefreshIcon, StarIcon, PlusIcon,
} from '../../components/icons'
import { formatCurrency, formatCurrencyShort } from '../../utils/formatCurrency'
import { formatDateTime } from '../../utils/formatDate'

export default function Dashboard() {
  const navigate = useNavigate()
  const { seller, refresh: refreshSeller, isOpen } = useSeller()
  const [orders, setOrders] = useState([])
  const [summary, setSummary] = useState(null)
  const [location, setLocation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [togglingOpen, setTogglingOpen] = useState(false)

  const load = async () => {
    try {
      setLoading(true)
      const [o, s, l] = await Promise.all([
        myOrders().catch(() => []),
        mySummary().catch(() => null),
        seller?.sellerId ? getSellerLocation(seller.sellerId).catch(() => null) : null,
      ])
      setOrders(Array.isArray(o) ? o : [])
      setSummary(s)
      setLocation(l)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (seller) load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seller?.sellerId])

  const handleToggleOpen = async () => {
    if (!seller) return
    setTogglingOpen(true)
    try {
      await updateOperatingStatus(seller.sellerId, isOpen ? 'CLOSED' : 'OPEN')
      await refreshSeller()
      toast.success(isOpen ? 'Store closed' : 'Store opened')
    } catch (err) {
      toast.error('Could not change status')
    } finally {
      setTogglingOpen(false)
    }
  }

  const handleAccept = async (orderId) => {
    try {
      await updateOrderStatus(orderId, 'ACCEPTED')
      toast.success('Order accepted')
      load()
    } catch {
      toast.error('Could not accept')
    }
  }

  if (loading) return <Loader />

  const active = orders.filter((o) =>
    ['PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY'].includes(o.orderStatus)
  )
  const pending = orders.filter((o) => o.orderStatus === 'PLACED')
  const ready = orders.filter((o) => o.orderStatus === 'READY')
  const todayOrders = orders.filter((o) => {
    const d = new Date(o.createdAt)
    const now = new Date()
    return d.toDateString() === now.toDateString()
  })

  const stats = [
    {
      label: "Today's orders",
      value: todayOrders.length,
      icon: <PackageIcon size={20} />,
      color: '#3B82F6',
      bg: '#EFF6FF',
    },
    {
      label: 'Pending',
      value: pending.length,
      icon: <ClockIcon size={20} />,
      color: '#B45309',
      bg: 'var(--warning-bg)',
    },
    {
      label: 'Ready',
      value: ready.length,
      icon: <CheckIcon size={20} />,
      color: '#10B981',
      bg: 'var(--success-bg)',
    },
    {
      label: 'Earnings',
      value: formatCurrencyShort(summary?.totalEarnings || 0),
      icon: <DollarSignIcon size={20} />,
      color: '#FF5C39',
      bg: 'var(--brand-primary-light)',
    },
  ]

  return (
    <div className="page container" style={{ padding: '40px 24px 80px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 24,
          marginBottom: 32,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1 style={{ fontSize: 32, marginBottom: 6, letterSpacing: '-0.03em' }}>
            Welcome, {seller?.storeName}
          </h1>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              fontSize: 13,
              color: 'var(--text-3)',
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <StarIcon size={14} filled /> 4.5
            </span>
            {location && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <MapPinIcon size={14} /> {location.city}
              </span>
            )}
            <span className={`badge badge--${(seller?.operatingStatus || '').toLowerCase()}`}>
              {seller?.operatingStatus}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <Button
            variant="outline"
            onClick={load}
            loading={loading}
          >
            <RefreshIcon size={16} /> Refresh
          </Button>
          <Button
            variant={isOpen ? 'danger' : 'success'}
            onClick={handleToggleOpen}
            loading={togglingOpen}
          >
            {isOpen ? 'Close store' : 'Open store'}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div
        className="stagger"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 40,
        }}
      >
        {stats.map((s, i) => (
          <div key={i} className="card" style={{ padding: 20 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 14,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--text-3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {s.label}
              </span>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: s.bg,
                  color: s.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {s.icon}
              </div>
            </div>
            <div
              style={{
                fontFamily: 'Plus Jakarta Sans',
                fontWeight: 800,
                fontSize: 28,
                letterSpacing: '-0.02em',
              }}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 12,
          marginBottom: 40,
        }}
      >
        <button
          onClick={() => navigate('/seller/foods/add')}
          className="card card--hover"
          style={{
            padding: 18,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'var(--gradient-primary)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PlusIcon size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Add new dish</div>
            <div style={{ fontSize: 12, color: 'var(--text-4)' }}>Expand your menu</div>
          </div>
        </button>

        <button
          onClick={() => navigate('/seller/foods')}
          className="card card--hover"
          style={{
            padding: 18,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'var(--bg-2)',
              color: 'var(--text-2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <StoreIcon size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Manage menu</div>
            <div style={{ fontSize: 12, color: 'var(--text-4)' }}>Edit or remove items</div>
          </div>
        </button>

        <button
          onClick={() => navigate('/seller/earnings')}
          className="card card--hover"
          style={{
            padding: 18,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'var(--success-bg)',
              color: 'var(--success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TrendingUpIcon size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Earnings</div>
            <div style={{ fontSize: 12, color: 'var(--text-4)' }}>See your revenue</div>
          </div>
        </button>
      </div>

      {/* Active orders */}
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}
        >
          <h2 style={{ fontSize: 22 }}>Active orders</h2>
          <button
            onClick={() => navigate('/seller/orders')}
            style={{
              color: 'var(--brand-primary)',
              fontWeight: 600,
              fontSize: 14,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
            }}
          >
            See all <ArrowRightIcon size={14} />
          </button>
        </div>

        {active.length === 0 ? (
          <div
            className="card"
            style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}
          >
            No active orders right now.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {active.slice(0, 5).map((o) => (
              <div key={o.orderId} className="card" style={{ padding: 20 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                    marginBottom: 12,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontFamily: 'Plus Jakarta Sans',
                        fontWeight: 800,
                        fontSize: 18,
                        marginBottom: 2,
                      }}
                    >
                      Order #LB{o.orderId}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-4)' }}>
                      {formatDateTime(o.createdAt)}
                    </div>
                  </div>
                  <Badge status={o.orderStatus}>{o.orderStatus.replace(/_/g, ' ')}</Badge>
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
                    <div style={{ fontSize: 12, color: 'var(--text-4)' }}>Total</div>
                    <div style={{ fontWeight: 800, fontSize: 20 }}>
                      {formatCurrency(o.totalAmount)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {o.orderStatus === 'PLACED' && (
                      <Button size="sm" onClick={() => handleAccept(o.orderId)}>
                        Accept
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/seller/orders/${o.orderId}`)}
                    >
                      View
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}