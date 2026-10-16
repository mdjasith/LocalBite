import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getOrder, updateOrderStatus, verifyDelivery } from '../../api/orderApi'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import Badge from '../../components/common/Badge'
import {
  ArrowLeftIcon, ClockIcon, MapPinIcon, PackageIcon,
  TruckIcon, ShieldIcon, LockIcon,
} from '../../components/icons'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDateTime } from '../../utils/formatDate'
import { extractError } from '../../api/axiosClient'
import { ORDER_TIMELINE, ORDER_STATUS_LABEL } from '../../utils/constants'

const NEXT_STATUS = {
  PLACED: { next: 'ACCEPTED', label: 'Accept order' },
  ACCEPTED: { next: 'PREPARING', label: 'Mark preparing' },
  PREPARING: { next: 'READY', label: 'Mark ready' },
  READY: { next: 'OUT_FOR_DELIVERY', label: 'Out for delivery' },
}

export default function SellerOrderDetails() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [otpInput, setOtpInput] = useState('')
  const [verifying, setVerifying] = useState(false)

  const load = async () => {
    try {
      const o = await getOrder(orderId)
      setOrder(o)
    } catch {
      toast.error('Order not found')
      navigate('/seller/orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId])

  const handleAdvance = async () => {
    const step = NEXT_STATUS[order.orderStatus]
    if (!step) return
    setUpdating(true)
    try {
      await updateOrderStatus(order.orderId, step.next)
      toast.success('Status updated')
      load()
    } catch (err) {
      toast.error(extractError(err))
    } finally {
      setUpdating(false)
    }
  }

  const handleVerifyDelivery = async () => {
    if (!otpInput.trim() || otpInput.length !== 4) {
      toast.error('Enter the 4-digit OTP from customer')
      return
    }
    setVerifying(true)
    try {
      await verifyDelivery(order.orderId, otpInput.trim())
      toast.success('Order delivered! Earnings added.')
      setOtpInput('')
      load()
    } catch (err) {
      toast.error(extractError(err))
    } finally {
      setVerifying(false)
    }
  }

  if (loading) return <Loader />
  if (!order) return null

  const step = NEXT_STATUS[order.orderStatus]
  const currentIdx = ORDER_TIMELINE.indexOf(order.orderStatus)
  const needsOtp = order.orderStatus === 'OUT_FOR_DELIVERY'

  return (
    <div className="page container" style={{ padding: '24px 24px 80px', maxWidth: 960 }}>
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
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 20,
          marginBottom: 32,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1 style={{ fontSize: 32, marginBottom: 8 }}>Order #LB{order.orderId}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: 'var(--text-3)' }}>
            <ClockIcon size={14} /> {formatDateTime(order.createdAt)}
          </div>
        </div>
        <Badge status={order.orderStatus} dot>
          {ORDER_STATUS_LABEL[order.orderStatus]}
        </Badge>
      </div>

      {/* OTP input — only when out for delivery */}
      {needsOtp && (
        <div
          style={{
            background: 'linear-gradient(135deg, #FF5C39 0%, #F43F5E 100%)',
            borderRadius: 'var(--r-2xl)',
            padding: 32,
            color: 'white',
            marginBottom: 24,
            boxShadow: 'var(--shadow-brand-lg)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.25), transparent 55%)',
            }}
          />
          <div style={{ position: 'relative' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 12,
                padding: '4px 12px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: 9999,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                backdropFilter: 'blur(10px)',
              }}
            >
              <ShieldIcon size={14} /> Confirm delivery
            </div>
            <h3 style={{ fontSize: 22, marginBottom: 8, color: 'white' }}>
              Ask the customer for their OTP
            </h3>
            <p style={{ fontSize: 14, opacity: 0.95, marginBottom: 20, lineHeight: 1.6 }}>
              Enter the 4-digit code the customer shows on their app to mark this order delivered.
            </p>

            <div style={{ display: 'flex', gap: 10 }}>
              <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                placeholder="0 0 0 0"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                style={{
                  flex: 1,
                  padding: '16px',
                  fontSize: 26,
                  fontWeight: 800,
                  letterSpacing: '0.4em',
                  textAlign: 'center',
                  border: 'none',
                  borderRadius: 'var(--r-md)',
                  fontFamily: 'Plus Jakarta Sans',
                  background: 'white',
                  color: 'var(--brand-primary)',
                }}
              />
              <Button
                onClick={handleVerifyDelivery}
                loading={verifying}
                disabled={otpInput.length !== 4}
                style={{ background: 'white', color: 'var(--brand-primary)', paddingLeft: 24, paddingRight: 24 }}
              >
                <LockIcon size={16} /> Verify
              </Button>
            </div>
          </div>
        </div>
      )}

      {order.orderStatus === 'DELIVERED' && (
        <div
          className="card"
          style={{
            padding: 24,
            marginBottom: 24,
            background: 'var(--success-bg)',
            border: '1px solid rgba(16,185,129,0.3)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--success)', marginBottom: 4 }}>
            ✓ Order delivered
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-3)' }}>
            Earnings of <strong>{formatCurrency(order.sellerEarnings)}</strong> added to your account.
          </div>
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 320px',
          gap: 24,
          alignItems: 'start',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <h3 style={{ fontSize: 18, marginBottom: 24 }}>Order progress</h3>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {ORDER_TIMELINE.map((s, i) => {
                const done = i <= currentIdx
                const active = i === currentIdx
                return (
                  <div key={s} style={{ display: 'flex', gap: 16 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: done ? 'var(--gradient-primary)' : 'var(--bg-2)',
                          color: done ? 'white' : 'var(--text-4)',
                          fontWeight: 700,
                          fontSize: 13,
                          boxShadow: active ? '0 0 0 6px rgba(255,92,57,0.15)' : 'none',
                        }}
                      >
                        {done ? '✓' : i + 1}
                      </div>
                      {i < ORDER_TIMELINE.length - 1 && (
                        <div
                          style={{
                            width: 2,
                            flex: 1,
                            minHeight: 32,
                            background: i < currentIdx ? 'var(--brand-primary)' : 'var(--border-1)',
                          }}
                        />
                      )}
                    </div>
                    <div style={{ paddingBottom: i < ORDER_TIMELINE.length - 1 ? 24 : 0, paddingTop: 4 }}>
                      <div
                        style={{
                          fontWeight: active ? 700 : 600,
                          fontSize: 14,
                          color: done ? 'var(--text-1)' : 'var(--text-4)',
                        }}
                      >
                        {ORDER_STATUS_LABEL[s]}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <PackageIcon size={20} color="var(--brand-primary)" />
              <h3 style={{ fontSize: 18, margin: 0 }}>Items</h3>
            </div>
            {(order.items || []).map((i) => (
              <div
                key={i.orderItemId}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingBottom: 12,
                  marginBottom: 12,
                  borderBottom: '1px solid var(--border-2)',
                  fontSize: 14,
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>{i.foodName}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-4)' }}>
                    {formatCurrency(i.pricePerItem)} × {i.quantity}
                  </div>
                </div>
                <div style={{ fontWeight: 700 }}>{formatCurrency(i.totalPrice)}</div>
              </div>
            ))}
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <TruckIcon size={20} color="var(--brand-primary)" />
              <h3 style={{ fontSize: 18, margin: 0 }}>Delivery address</h3>
            </div>
            <div
              style={{
                display: 'flex',
                gap: 10,
                padding: 12,
                background: 'var(--bg-2)',
                borderRadius: 'var(--r-md)',
                fontSize: 14,
                color: 'var(--text-2)',
              }}
            >
              <MapPinIcon size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              <div>{order.deliveryAddress}</div>
            </div>
          </div>
        </div>

        <div className="card" style={{ position: 'sticky', top: 96 }}>
          <h3 style={{ fontSize: 18, marginBottom: 20 }}>Summary</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: 'var(--text-3)' }}>Food subtotal</span>
              <span>{formatCurrency(order.foodSubtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: 'var(--text-3)' }}>Delivery fee</span>
              <span>{formatCurrency(order.deliveryFee)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: 'var(--text-3)' }}>Commission (10%)</span>
              <span style={{ color: 'var(--danger)' }}>
                −{formatCurrency(order.platformCommission)}
              </span>
            </div>
          </div>

          <div
            style={{
              paddingTop: 16,
              borderTop: '1px solid var(--border-2)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
            }}
          >
            <span style={{ fontWeight: 700 }}>Your earnings</span>
            <span
              style={{
                fontFamily: 'Plus Jakarta Sans',
                fontWeight: 800,
                fontSize: 22,
                color: 'var(--success)',
              }}
            >
              {formatCurrency(order.sellerEarnings)}
            </span>
          </div>

          {step ? (
            <Button size="lg" block onClick={handleAdvance} loading={updating}>
              {step.label}
            </Button>
          ) : order.orderStatus === 'OUT_FOR_DELIVERY' ? (
            <div
              style={{
                padding: 16,
                background: 'var(--warning-bg)',
                borderRadius: 'var(--r-md)',
                textAlign: 'center',
                fontSize: 13,
                color: '#B45309',
              }}
            >
              Enter customer's OTP above to mark delivered
            </div>
          ) : order.orderStatus === 'DELIVERED' ? (
            <div
              style={{
                padding: 16,
                background: 'var(--success-bg)',
                borderRadius: 'var(--r-md)',
                textAlign: 'center',
                fontSize: 13,
                color: 'var(--success)',
                fontWeight: 600,
              }}
            >
              Order completed
            </div>
          ) : (
            <div
              style={{
                padding: 16,
                background: 'var(--bg-2)',
                borderRadius: 'var(--r-md)',
                textAlign: 'center',
                fontSize: 13,
                color: 'var(--text-3)',
              }}
            >
              No further action
            </div>
          )}
        </div>
      </div>
    </div>
  )
}