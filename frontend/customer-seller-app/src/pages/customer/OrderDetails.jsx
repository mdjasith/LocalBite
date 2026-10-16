import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getOrder, viewOrderOtp, cancelOrder } from '../../api/orderApi'
import { getDeliveryByOrder } from '../../api/deliveryApi'
import { invoiceByOrder, generateInvoice, downloadInvoice } from '../../api/invoiceApi'
import { reviewsByOrder } from '../../api/reviewApi'
import { paymentByOrder } from '../../api/paymentApi'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import Badge from '../../components/common/Badge'
import ConfirmModal from '../../components/common/ConfirmModal'
import {
  ArrowLeftIcon, ClockIcon, PackageIcon, TruckIcon,
  CheckIcon, MapPinIcon, DownloadIcon, ShieldIcon, PhoneIcon,
  StarIcon, XCircleIcon, CheckCircleIcon, WalletIcon, CreditCardIcon, DollarSignIcon,
} from '../../components/icons'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDateTime } from '../../utils/formatDate'
import { extractError } from '../../api/axiosClient'
import { ORDER_TIMELINE, ORDER_STATUS_LABEL } from '../../utils/constants'

export default function OrderDetails() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { role } = useAuth()
  const [order, setOrder] = useState(null)
  const [delivery, setDelivery] = useState(null)
  const [otpData, setOtpData] = useState(null)
  const [invoice, setInvoice] = useState(null)
  const [myReviews, setMyReviews] = useState([])
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCancel, setShowCancel] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [refundProcessing, setRefundProcessing] = useState(false)
  const [refundData, setRefundData] = useState(null)

  const loadOrder = async (silent = false) => {
    try {
      const o = await getOrder(orderId)
      setOrder(o)
      return o
    } catch {
      if (!silent) {
        toast.error('Could not load order')
        navigate('/orders')
      }
      return null
    }
  }

  const load = async () => {
    const o = await loadOrder(false)
    if (o) {
      getDeliveryByOrder(orderId).then(setDelivery).catch(() => {})
      invoiceByOrder(orderId).then(setInvoice).catch(() => {})
      reviewsByOrder(orderId).then((r) => setMyReviews(Array.isArray(r) ? r : [])).catch(() => {})
      paymentByOrder(orderId).then(setPayment).catch(() => {})
    }
    setLoading(false)
  }

  useEffect(() => { load() /* eslint-disable-next-line */ }, [orderId])

  // Poll the order every 5 seconds so we see seller/auto-advance progress
  useEffect(() => {
    if (!order) return
    const terminal = ['DELIVERED', 'CANCELLED', 'FAILED'].includes(order.orderStatus)
    if (terminal) return

    const interval = setInterval(async () => {
      const fresh = await loadOrder(true)
      if (fresh && fresh.orderStatus !== order.orderStatus) {
        getDeliveryByOrder(orderId).then(setDelivery).catch(() => {})
        paymentByOrder(orderId).then(setPayment).catch(() => {})
      }
    }, 5000)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.orderStatus, orderId])

  // Auto-fetch OTP while out for delivery
  useEffect(() => {
    if (!order) return
    const status = order.orderStatus
    const isOtpStage = ['OUT_FOR_DELIVERY', 'OTP_VERIFICATION'].includes(status)
    if (!isOtpStage) { setOtpData(null); return }
    let cancelled = false
    const fetchOtp = async () => {
      try {
        const data = await viewOrderOtp(orderId)
        if (!cancelled) setOtpData(data)
      } catch { /* silent */ }
    }
    fetchOtp()
    const interval = setInterval(fetchOtp, 8000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [order?.orderStatus, orderId])

  const handleCancel = async () => {
    setCancelling(true)
    try {
      let freshPayment = payment
      try {
        freshPayment = await paymentByOrder(orderId)
        setPayment(freshPayment)
      } catch { /* silent */ }

      const payStatus = freshPayment?.paymentStatus || order.paymentStatus
      const payMethod = freshPayment?.paymentMethod || 'COD'
      const payDetail = freshPayment?.paymentDetail || ''
      const hasPaymentRecord = !!freshPayment

      const wasPaid = hasPaymentRecord && payStatus === 'SUCCESS'
      const amt = Number(order.totalAmount)

      setShowCancel(false)

      if (wasPaid) {
        setRefundProcessing(true)
        await new Promise((r) => setTimeout(r, 10000))
      }

      await cancelOrder(orderId)
      await load()

      if (wasPaid) {
        let updatedPayment = null
        try { updatedPayment = await paymentByOrder(orderId) } catch { /* silent */ }

        const taxAmt = +(amt * 0.02).toFixed(2)
        const refunded = updatedPayment?.refundedAmount != null
          ? Number(updatedPayment.refundedAmount)
          : +(amt - taxAmt).toFixed(2)

        setRefundData({
          amount: refunded,
          tax: taxAmt,
          original: amt,
          txnRef: updatedPayment?.transactionReference || `REF-${orderId}-${Date.now()}`,
          method: payMethod,
          detail: payDetail,
        })
        setRefundProcessing(false)
        setShowRefundModal(true)
      } else {
        setRefundData({
          amount: 0,
          tax: 0,
          original: amt,
          txnRef: `CAN-${orderId}-${Date.now()}`,
          method: payMethod || 'COD',
          detail: payDetail || 'Cash on delivery',
        })
        setShowRefundModal(true)
      }
    } catch (err) {
      setRefundProcessing(false)
      toast.error(extractError(err))
    } finally {
      setCancelling(false)
    }
  }

  const handleDownloadInvoice = async () => {
    try {
      let inv = invoice
      if (!inv) {
        inv = await generateInvoice({
          orderId: Number(orderId),
          customerId: order.customerId,
          sellerId: order.sellerId,
          customerName: 'Customer',
          sellerName: `Seller #${order.sellerId}`,
          deliveryAddress: order.deliveryAddress,
          items: (order.items || []).map((i) => ({
            foodName: i.foodName, quantity: i.quantity,
            price: i.pricePerItem, totalPrice: i.totalPrice,
          })),
          foodSubtotal: order.foodSubtotal,
          deliveryFee: order.deliveryFee,
          totalAmount: order.totalAmount,
        })
        setInvoice(inv)
      }
      const blob = await downloadInvoice(orderId)
      const url = window.URL.createObjectURL(new Blob([blob]))
      const a = document.createElement('a')
      a.href = url
      a.download = `${inv.invoiceNumber || 'invoice'}.pdf`
      document.body.appendChild(a); a.click(); a.remove()
    } catch { toast.error('Could not download invoice') }
  }

  if (loading) return <Loader />
  if (!order) return null

  const currentIdx = ORDER_TIMELINE.indexOf(order.orderStatus)
  const showOtp = otpData && ['OUT_FOR_DELIVERY', 'OTP_VERIFICATION'].includes(order.orderStatus)
  const canCancel = ['PLACED', 'ACCEPTED'].includes(order.orderStatus) && order.orderStatus !== 'CANCELLED'
  const canReview = order.orderStatus === 'DELIVERED'
  const alreadyReviewed = myReviews.length > 0

  const isRefunded = order.paymentStatus === 'REFUNDED'
  const isPaid = order.paymentStatus === 'SUCCESS' || payment?.paymentStatus === 'SUCCESS'
  const isPendingPayment = order.paymentStatus === 'PENDING' && payment?.paymentStatus !== 'SUCCESS'

  const paymentIcon = payment?.paymentMethod === 'UPI' ? <WalletIcon size={14} />
    : payment?.paymentMethod === 'CARD' ? <CreditCardIcon size={14} />
    : payment?.paymentMethod === 'COD' ? <DollarSignIcon size={14} /> : null

  return (
    <div className="page container" style={{ padding: '24px 24px 80px', maxWidth: 960 }}>
      <button onClick={() => navigate(-1)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 9999, background: 'white', border: '1px solid var(--border-1)', fontSize: 14, fontWeight: 600, marginBottom: 24, cursor: 'pointer' }}>
        <ArrowLeftIcon size={16} /> Back
      </button>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, marginBottom: 32, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 32, marginBottom: 8 }}>Order #LB{order.orderId}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: 'var(--text-3)', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><ClockIcon size={14} /> {formatDateTime(order.createdAt)}</span>
            {isPaid && payment && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--success)', fontWeight: 700 }}>
                {paymentIcon} Paid via {payment.paymentMethod}
              </span>
            )}
            {isRefunded && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#B45309', fontWeight: 700 }}>
                ↩ Refunded
              </span>
            )}
          </div>
        </div>
        <Badge status={order.orderStatus} dot>{ORDER_STATUS_LABEL[order.orderStatus] || order.orderStatus}</Badge>
      </div>

      {isPendingPayment && order.orderStatus === 'PLACED' && (
        <div style={{ background: 'var(--warning-bg)', border: '1px solid #FCD34D', borderRadius: 16, padding: 20, marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontWeight: 700, color: '#B45309', marginBottom: 4 }}>Payment pending</div>
            <div style={{ fontSize: 13, color: '#92400E' }}>Complete payment to send this order to the seller.</div>
          </div>
          <Button onClick={() => navigate(`/payment/${order.orderId}`)}>Pay now</Button>
        </div>
      )}

      {isRefunded && (
        <div style={{ background: 'var(--success-bg)', border: '1px solid rgba(16,185,129,0.4)', borderRadius: 16, padding: 20, marginBottom: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
          <CheckCircleIcon size={22} style={{ color: 'var(--success)' }} />
          <div>
            <div style={{ fontWeight: 700, color: 'var(--success)', marginBottom: 2 }}>Refund completed</div>
            <div style={{ fontSize: 13, color: 'var(--text-3)' }}>
              {formatCurrency(payment?.refundedAmount || order.totalAmount * 0.98)} has been refunded to your original payment method.
            </div>
          </div>
        </div>
      )}

      {showOtp && (
        <div style={{ background: 'linear-gradient(135deg, #FF5C39 0%, #F43F5E 100%)', borderRadius: 'var(--r-2xl)', padding: 32, color: 'white', marginBottom: 24, boxShadow: 'var(--shadow-brand-lg)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.25), transparent 55%)' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 12, padding: '4px 12px', background: 'rgba(255,255,255,0.22)', borderRadius: 9999, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              <ShieldIcon size={14} /> Delivery OTP
            </div>
            <div style={{ fontSize: 15, marginBottom: 4, opacity: 0.95 }}>Give this code to the seller when your food arrives</div>
            <div style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 'clamp(48px, 12vw, 72px)', letterSpacing: '0.4em', textAlign: 'center', margin: '20px 0', paddingLeft: '0.4em', wordBreak: 'break-all' }}>{otpData.otp}</div>
            <div style={{ textAlign: 'center', fontSize: 13, opacity: 0.9 }}>Do not share before delivery</div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: 24, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
          <div className="card">
            <h3 style={{ fontSize: 18, marginBottom: 24 }}>Order tracking</h3>
            {order.orderStatus === 'CANCELLED' || order.orderStatus === 'FAILED' ? (
              <div style={{ padding: 16, background: 'var(--danger-bg)', borderRadius: 'var(--r-md)', color: 'var(--danger)', fontWeight: 600 }}>
                This order was {order.orderStatus.toLowerCase()}.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {ORDER_TIMELINE.map((step, i) => {
                  const done = i <= currentIdx
                  const active = i === currentIdx
                  return (
                    <div key={step} style={{ display: 'flex', gap: 16 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? 'var(--gradient-primary)' : 'var(--bg-2)', color: done ? 'white' : 'var(--text-4)', fontWeight: 700, fontSize: 13, boxShadow: active ? '0 0 0 6px rgba(255,92,57,0.15)' : 'none', flexShrink: 0 }}>
                          {done ? <CheckIcon size={16} /> : i + 1}
                        </div>
                        {i < ORDER_TIMELINE.length - 1 && (
                          <div style={{ width: 2, flex: 1, minHeight: 32, background: i < currentIdx ? 'var(--brand-primary)' : 'var(--border-1)' }} />
                        )}
                      </div>
                      <div style={{ paddingBottom: i < ORDER_TIMELINE.length - 1 ? 24 : 0, paddingTop: 4, minWidth: 0 }}>
                        <div style={{ fontWeight: active ? 700 : 600, fontSize: 14, color: done ? 'var(--text-1)' : 'var(--text-4)' }}>
                          {ORDER_STATUS_LABEL[step]}
                        </div>
                        {active && <div style={{ fontSize: 12, color: 'var(--brand-primary)', marginTop: 2 }}>In progress</div>}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {delivery && (
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <TruckIcon size={20} color="var(--brand-primary)" />
                <h3 style={{ fontSize: 18, margin: 0 }}>Delivery</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <span style={{ color: 'var(--text-3)' }}>Status</span>
                  <Badge status={delivery.deliveryStatus}>{delivery.deliveryStatus?.replace(/_/g, ' ')}</Badge>
                </div>
                {delivery.deliveryPersonName && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <span style={{ color: 'var(--text-3)' }}>Delivering</span>
                    <span style={{ fontWeight: 600, textAlign: 'right' }}>{delivery.deliveryPersonName}</span>
                  </div>
                )}
                {delivery.deliveryPersonPhone && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                    <span style={{ color: 'var(--text-3)' }}>Phone</span>
                    <a href={`tel:${delivery.deliveryPersonPhone}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600, color: 'var(--brand-primary)' }}>
                      <PhoneIcon size={14} /> {delivery.deliveryPersonPhone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <PackageIcon size={20} color="var(--brand-primary)" />
              <h3 style={{ fontSize: 18, margin: 0 }}>Items</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {(order.items || []).map((i) => (
                <div key={i.orderItemId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, paddingBottom: 12, borderBottom: '1px solid var(--border-2)', gap: 12 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, marginBottom: 2 }}>{i.foodName}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-4)' }}>{formatCurrency(i.pricePerItem)} × {i.quantity}</div>
                  </div>
                  <div style={{ fontWeight: 700, flexShrink: 0 }}>{formatCurrency(i.totalPrice)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', minWidth: 0 }}>
          <div className="card">
            <h3 style={{ fontSize: 18, marginBottom: 20 }}>Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: 'var(--text-3)' }}>Food subtotal</span><span>{formatCurrency(order.foodSubtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: 'var(--text-3)' }}>Delivery fee</span><span>{formatCurrency(order.deliveryFee)}</span>
              </div>
            </div>
            <div style={{ paddingTop: 16, borderTop: '1px solid var(--border-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700 }}>Total</span>
              <span style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 24, letterSpacing: '-0.02em' }}>{formatCurrency(order.totalAmount)}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: 12, background: 'var(--bg-2)', borderRadius: 'var(--r-md)', fontSize: 13, lineHeight: 1.5, color: 'var(--text-3)', marginBottom: 16 }}>
              <MapPinIcon size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ minWidth: 0, wordBreak: 'break-word' }}>{order.deliveryAddress}</div>
            </div>
            <Button variant="outline" block onClick={handleDownloadInvoice}>
              <DownloadIcon size={16} /> {invoice ? 'Download invoice' : 'Generate invoice'}
            </Button>
          </div>

          {canCancel && (
            <div className="card">
              <h3 style={{ fontSize: 16, marginBottom: 12 }}>Cancel order</h3>
              <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 12, lineHeight: 1.5 }}>
                {isPaid
                  ? 'Cancel before the seller starts preparing. A 2% cancellation fee applies.'
                  : 'Cancel before the seller starts preparing.'}
              </p>
              <Button variant="danger" block onClick={() => setShowCancel(true)}>
                <XCircleIcon size={16} /> Cancel this order
              </Button>
            </div>
          )}

          {canReview && (
            <div className="card">
              <h3 style={{ fontSize: 16, marginBottom: 12 }}>Share your experience</h3>
              {alreadyReviewed ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--success)', fontWeight: 600 }}>
                  <CheckIcon size={16} /> You already reviewed this order
                </div>
              ) : (
                <>
                  <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 12, lineHeight: 1.5 }}>Rate the food you received.</p>
                  <Button block onClick={() => navigate(`/orders/${orderId}/review`)}>
                    <StarIcon size={16} filled /> Write a review
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        open={showCancel}
        title="Cancel this order?"
        message={isPaid
          ? 'A 2% cancellation fee will be deducted. You\'ll receive the refund in a few seconds.'
          : 'This will cancel the order.'}
        confirmLabel="Cancel order"
        cancelLabel="Keep order"
        variant="danger"
        onConfirm={handleCancel}
        onCancel={() => setShowCancel(false)}
      />

      {refundProcessing && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: 380, textAlign: 'center', padding: 40 }}>
            <div style={{ display: 'inline-flex', padding: 20, borderRadius: 20, background: 'var(--brand-primary-light)', marginBottom: 20 }}>
              <div className="loader" style={{ width: 44, height: 44 }} />
            </div>
            <div style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 18, marginBottom: 8 }}>
              Processing refund
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.6 }}>
              Contacting your bank...<br />
              This usually takes a few seconds.
            </div>
            <div style={{ marginTop: 20, fontSize: 11, color: 'var(--text-4)' }}>
              Please don't close this window
            </div>
          </div>
        </div>
      )}

      {showRefundModal && refundData && (
        <BankRefundModal
          data={refundData}
          onClose={() => { setShowRefundModal(false); navigate('/orders') }}
        />
      )}
    </div>
  )
}

function BankRefundModal({ data, onClose }) {
  const isUpi = data.method === 'UPI'
  const isCod = data.method === 'COD'

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 420, padding: 0, overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
        <div style={{
          background: 'linear-gradient(135deg, #10B981, #059669)',
          padding: '16px 20px', color: 'white',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(10px)',
            flexShrink: 0,
          }}>
            <CheckCircleIcon size={22} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, opacity: 0.9, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 700 }}>
              {isUpi ? 'UPI Refund' : isCod ? 'Order Cancelled' : 'Bank Refund'}
            </div>
            <div style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 15 }}>
              {isUpi ? 'Money credited via UPI' : isCod ? 'No payment to refund' : 'Amount credited to your card'}
            </div>
          </div>
        </div>

        <div style={{ padding: '28px 24px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 6 }}>
            {isCod ? 'Refund amount' : 'Amount credited'}
          </div>
          <div style={{
            fontFamily: 'Plus Jakarta Sans', fontWeight: 800,
            fontSize: 'clamp(32px, 10vw, 44px)', letterSpacing: '-0.03em',
            color: isCod ? 'var(--text-2)' : 'var(--success)',
            marginBottom: 8,
            wordBreak: 'break-word',
          }}>
            {isCod ? '₹0.00' : `₹${data.amount.toFixed(2)}`}
          </div>
          {!isCod && data.tax > 0 && (
            <div style={{
              display: 'inline-block', padding: '4px 12px',
              background: 'var(--warning-bg)', borderRadius: 9999,
              fontSize: 11, fontWeight: 700, color: '#B45309',
            }}>
              2% cancellation fee applied (₹{data.tax.toFixed(2)})
            </div>
          )}
          {isCod && (
            <div style={{
              display: 'inline-block', padding: '4px 12px',
              background: 'var(--bg-2)', borderRadius: 9999,
              fontSize: 11, fontWeight: 700, color: 'var(--text-3)',
            }}>
              No payment was charged
            </div>
          )}
        </div>

        <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
          <Row label="Reference" value={data.txnRef} mono />
          <Row label={isUpi ? 'UPI ID' : isCod ? 'Payment' : 'Card'} value={isCod ? 'Cash on delivery' : (data.detail || '—')} />
          <Row label="Original amount" value={`₹${data.original.toFixed(2)}`} />
          <Row label="Status" value={
            <span style={{ color: isCod ? 'var(--text-3)' : 'var(--success)', fontWeight: 700 }}>
              {isCod ? 'No refund needed' : 'Completed'}
            </span>
          } />
        </div>

        <div style={{ padding: '0 24px 24px', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Button variant="outline" onClick={onClose} style={{ flex: 1, minWidth: 120 }}>Close</Button>
          <Button onClick={onClose} style={{ flex: 1, minWidth: 120 }}>View orders</Button>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, mono }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-2)', gap: 12 }}>
      <span style={{ color: 'var(--text-3)', fontSize: 12, flexShrink: 0 }}>{label}</span>
      <span style={{ fontWeight: 600, fontFamily: mono ? 'monospace' : 'inherit', fontSize: 13, textAlign: 'right', minWidth: 0, wordBreak: 'break-word' }}>{value}</span>
    </div>
  )
}