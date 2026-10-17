import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getOrder } from '../../api/orderApi'
import { processPayment } from '../../api/paymentApi'
import { useAuth } from '../../context/AuthContext'
import { sendOrderConfirmation, scheduleThankYouEmail } from '../../utils/emailService'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import Input from '../../components/common/Input'
import {
  ArrowLeftIcon, ShieldIcon, LockIcon, InfoIcon,
  CreditCardIcon, WalletIcon, DollarSignIcon,
} from '../../components/icons'
import {
  GpayLogo, PhonePeLogo, PaytmLogo, BhimLogo, AmazonPayLogo, CardBrandLogo,
} from '../../components/brand/UpiLogos'
import { formatCurrency } from '../../utils/formatCurrency'
import { extractError } from '../../api/axiosClient'

const COD_FEE = 10

const UPI_APPS = [
  { id: 'gpay',    name: 'Google Pay',  handle: '@okicici', logo: <GpayLogo size={44} /> },
  { id: 'phonepe', name: 'PhonePe',     handle: '@ybl',     logo: <PhonePeLogo size={44} /> },
  { id: 'paytm',   name: 'Paytm',       handle: '@paytm',   logo: <PaytmLogo size={44} /> },
  { id: 'bhim',    name: 'BHIM UPI',    handle: '@upi',     logo: <BhimLogo size={44} /> },
  { id: 'amazon',  name: 'Amazon Pay',  handle: '@apl',     logo: <AmazonPayLogo size={44} /> },
]

export default function Payment() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { userId, email } = useAuth()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  const [stage, setStage] = useState('method')
  const [method, setMethod] = useState(null)
  const [upiApp, setUpiApp] = useState(null)
  const [upiId, setUpiId] = useState('')
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' })
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const o = await getOrder(orderId)
        if (o.paymentStatus === 'SUCCESS') {
          toast.success('Order already paid')
          navigate(`/order-success/${orderId}`, { replace: true })
          return
        }
        setOrder(o)
      } catch {
        toast.error('Order not found')
        navigate('/orders')
      } finally {
        setLoading(false)
      }
    })()
  }, [orderId, navigate])

  const cardBrand = (() => {
    const n = card.number.replace(/\s/g, '')
    if (n.startsWith('4')) return 'visa'
    if (n.startsWith('5')) return 'mastercard'
    if (n.startsWith('6')) return 'rupay'
    return null
  })()

  const triggerEmails = (orderObj, methodUsed, amountPaid) => {
    try {
      const name = email?.split('@')[0] || 'Customer'
      console.log(`[Payment] Triggering emails for ${email}`)
      
      sendOrderConfirmation({
        toEmail: email,
        customerName: name,
        orderId: orderObj.orderId,
        amount: amountPaid,
        paymentMethod: methodUsed,
        deliveryAddress: orderObj.deliveryAddress,
      })
      scheduleThankYouEmail({ toEmail: email, customerName: name })
    } catch (err) {
      console.warn('[Payment] Email trigger failed:', err)
    }
  }

  const processOnline = async () => {
    setProcessing(true)
    setStage('processing')

    const foodSubtotal = Number(order.foodSubtotal) || 0
    const totalAmount = Number(order.totalAmount) || (foodSubtotal + 30)
    const platformCommission = Number(order.platformCommission) || (foodSubtotal * 0.10)
    const sellerAmount = Number(order.sellerEarnings) || (foodSubtotal - platformCommission)
    const finalAmount = totalAmount + (method === 'COD' ? COD_FEE : 0)

    let detail = null
    if (method === 'UPI') detail = `${upiApp.id}-${upiId || 'user' + upiApp.handle}`
    if (method === 'CARD') detail = `${cardBrand || 'card'}-****${card.number.slice(-4)}`

    const payload = {
      orderId: Number(order.orderId),
      customerId: Number(order.customerId),
      sellerId: Number(order.sellerId),
      amount: finalAmount,
      platformCommission: platformCommission,
      sellerAmount: sellerAmount,
      paymentMethod: method,
      paymentDetail: detail,
      idempotencyKey: `PAY-${order.orderId}-${method}-${Date.now()}`,
    }

    try {
      await processPayment(payload)

      // Fire emails AFTER payment succeeds
      triggerEmails(order, method, finalAmount)

      toast.success(method === 'COD' ? 'Order placed — pay on delivery' : 'Payment successful')
      navigate(`/order-success/${order.orderId}`, { replace: true })
    } catch (err) {
      toast.error(extractError(err))
      setStage('summary')
      setProcessing(false)
    }
  }

  if (loading) return <Loader />
  if (!order) return null

  const subtotal = Number(order.foodSubtotal || 0)
  const deliveryFee = Number(order.deliveryFee || 0)
  const baseTotal = Number(order.totalAmount || 0)
  const codFee = method === 'COD' ? COD_FEE : 0
  const grandTotal = baseTotal + codFee

  return (
    <div className="page" style={{ background: '#F5F5F7', minHeight: 'calc(100vh - var(--navbar-h))' }}>
      <div className="container" style={{ padding: '24px 24px 100px', maxWidth: 520 }}>
        
        <button onClick={() => navigate(-1)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 9999, background: 'white', border: '1px solid var(--border-1)', fontSize: 14, fontWeight: 600, marginBottom: 20, cursor: 'pointer' }}>
          <ArrowLeftIcon size={16} /> Back
        </button>

        <div style={{ background: 'linear-gradient(135deg, #FF5C39, #F43F5E)', borderRadius: 20, padding: 24, marginBottom: 16, color: 'white', boxShadow: '0 20px 40px -10px rgba(255,92,57,0.4)' }}>
          <div style={{ fontSize: 11, opacity: 0.9, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 700 }}>
            Order #LB{order.orderId}
          </div>
          <div style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 34, letterSpacing: '-0.03em', marginTop: 4 }}>
            {formatCurrency(grandTotal)}
          </div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 6 }}>🔒 Simulated payment</div>
        </div>

        {stage === 'method' && (
          <>
            <h3 style={{ fontSize: 16, marginBottom: 12, paddingLeft: 4 }}>Choose payment method</h3>
            <MethodCard icon={<WalletIcon size={22} />} gradient="linear-gradient(135deg, #7C3AED, #4F46E5)" title="UPI" subtitle="Google Pay · PhonePe" onClick={() => { setMethod('UPI'); setStage('upi-app') }} />
            <MethodCard icon={<CreditCardIcon size={22} />} gradient="linear-gradient(135deg, #3B82F6, #1D4ED8)" title="Credit / Debit Card" subtitle="Visa · Mastercard" onClick={() => { setMethod('CARD'); setStage('card') }} />
            <MethodCard icon={<DollarSignIcon size={22} />} gradient="linear-gradient(135deg, #10B981, #059669)" title="Cash on Delivery" subtitle={`+₹${COD_FEE} handling`} onClick={() => { setMethod('COD'); setStage('summary') }} />
          </>
        )}

        {stage === 'upi-app' && (
          <>
            <h3 style={{ fontSize: 16, marginBottom: 12, paddingLeft: 4 }}>Choose UPI app</h3>
            {UPI_APPS.map((app) => (
              <button key={app.id} onClick={() => { setUpiApp(app); setStage('upi-id') }} style={{ width: '100%', background: 'white', borderRadius: 16, padding: 16, marginBottom: 10, cursor: 'pointer', textAlign: 'left', border: '1px solid var(--border-1)', display: 'flex', alignItems: 'center', gap: 14 }}>
                {app.logo}
                <div style={{ flex: 1, fontWeight: 700, fontSize: 15 }}>{app.name}</div>
              </button>
            ))}
          </>
        )}

        {stage === 'upi-id' && upiApp && (
          <>
            <div style={{ background: 'white', borderRadius: 16, padding: 20, marginBottom: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, display: 'block' }}>Your UPI ID</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="text" autoFocus placeholder="yourname" value={upiId} onChange={(e) => setUpiId(e.target.value.replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 40))} style={{ flex: 1, height: 48, padding: '0 14px', border: '1.5px solid var(--border-1)', borderRadius: 12, fontSize: 15 }} />
                <div style={{ height: 48, padding: '0 16px', borderRadius: 12, background: 'var(--bg-2)', display: 'flex', alignItems: 'center', fontWeight: 700, fontSize: 14 }}>{upiApp.handle}</div>
              </div>
            </div>
            <Button block size="lg" disabled={!upiId.trim()} onClick={() => setStage('summary')}>Continue to pay {formatCurrency(grandTotal)}</Button>
          </>
        )}

        {stage === 'card' && (
          <div style={{ background: 'white', borderRadius: 16, padding: 20 }}>
            <Input label="Card number" placeholder="1234 5678 9012 3456" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19) })} />
            <Input label="Cardholder name" placeholder="Name" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Input label="Expiry" placeholder="MM/YY" value={card.expiry} onChange={(e) => { const v = e.target.value.replace(/\D/g, '').slice(0, 4); setCard({ ...card, expiry: v.length > 2 ? `${v.slice(0, 2)}/${v.slice(2)}` : v }) }} />
              <Input label="CVV" type="password" placeholder="•••" value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })} />
            </div>
            <Button block size="lg" disabled={card.number.replace(/\s/g, '').length < 16 || !card.name || card.expiry.length < 5 || card.cvv.length < 3} onClick={() => setStage('summary')} style={{ marginTop: 8 }}>Continue</Button>
          </div>
        )}

        {stage === 'summary' && (
          <>
            <h3 style={{ fontSize: 16, marginBottom: 12 }}>Review your bill</h3>
            <div className="card" style={{ padding: 20, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}><span>Item total</span><span>{formatCurrency(subtotal)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}><span>Delivery fee</span><span>{formatCurrency(deliveryFee)}</span></div>
              {method === 'COD' && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}><span>COD handling fee</span><span>+ {formatCurrency(COD_FEE)}</span></div>}
              <div style={{ paddingTop: 14, marginTop: 14, borderTop: '1.5px solid var(--border-1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700 }}>To pay</span><span style={{ fontWeight: 800, fontSize: 24 }}>{formatCurrency(grandTotal)}</span>
              </div>
            </div>
            <Button block size="lg" onClick={processOnline} loading={processing}>
              <LockIcon size={16} /> Pay {formatCurrency(grandTotal)}
            </Button>
          </>
        )}

        {stage === 'processing' && (
          <div className="card" style={{ padding: 60, textAlign: 'center', borderRadius: 20 }}>
            <div className="loader" style={{ width: 48, height: 48, margin: '0 auto 24px' }} />
            <div style={{ fontWeight: 700, fontSize: 18 }}>Processing payment</div>
            <div style={{ color: 'var(--text-3)', fontSize: 13 }}>Please don't close this page</div>
          </div>
        )}
      </div>
    </div>
  )
}

function MethodCard({ icon, gradient, title, subtitle, onClick }) {
  return (
    <button onClick={onClick} style={{ width: '100%', background: 'white', borderRadius: 16, padding: 18, marginBottom: 10, cursor: 'pointer', textAlign: 'left', border: '1px solid var(--border-1)', display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 48, height: 48, borderRadius: 14, background: gradient, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
      <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 15 }}>{title}</div><div style={{ fontSize: 13, color: 'var(--text-4)' }}>{subtitle}</div></div>
    </button>
  )
}