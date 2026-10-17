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
      const name = email?.split('@')[0] || 'there'
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
      console.warn('[payment] email trigger failed', err)
    }
  }

  const processOnline = async () => {
    setProcessing(true)
    setStage('processing')

    // BULLETPROOF NUMBER CALCULATIONS TO PREVENT NaN ERRORS
    const foodSubtotal = Number(order.foodSubtotal) || 0
    const totalAmount = Number(order.totalAmount) || (foodSubtotal + 30)
    
    // Fallbacks if backend didn't send these fields
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

    console.log("Sending Payment Payload:", payload) // DEBUG LOG

    try {
      await processPayment(payload)

      triggerEmails(order, method, finalAmount)

      toast.success(method === 'COD' ? 'Order placed — pay on delivery' : 'Payment successful')
      navigate(`/order-success/${order.orderId}`, { replace: true })
    } catch (err) {
      toast.error(extractError(err))
      setStage('summary')
      setProcessing(false)
    }
  }

  const processCod = async () => {
    setProcessing(true)
    setStage('processing')
    try {
      await new Promise((r) => setTimeout(r, 700))
      const foodSubtotal = Number(order.foodSubtotal) || 0
      const totalAmount = Number(order.totalAmount) || (foodSubtotal + 30)
      
      triggerEmails(order, 'COD', totalAmount + COD_FEE)
      
      toast.success('Order confirmed — pay on delivery')
      navigate(`/order-success/${order.orderId}`, { replace: true })
    } catch {
      toast.error('Could not confirm order')
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

  const goBack = () => {
    if (stage === 'method') navigate(-1)
    else if (stage === 'upi-app' || stage === 'card' || stage === 'cod') {
      setStage('method'); setMethod(null)
    } else if (stage === 'upi-id') {
      setStage('upi-app'); setUpiApp(null)
    } else if (stage === 'summary') {
      if (method === 'UPI') setStage('upi-id')
      else if (method === 'CARD') setStage('card')
      else setStage('method')
    } else navigate(-1)
  }

  return (
    <div className="page" style={{ background: '#F5F5F7', minHeight: 'calc(100vh - var(--navbar-h))' }}>
      <div className="container" style={{ padding: '24px 24px 100px', maxWidth: 520 }}>
        
        <button
          onClick={goBack}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '8px 14px', borderRadius: 9999, background: 'white',
            border: '1px solid var(--border-1)', fontSize: 14, fontWeight: 600,
            marginBottom: 20, cursor: 'pointer',
          }}
        >
          <ArrowLeftIcon size={16} /> Back
        </button>

        <div style={{
          background: 'linear-gradient(135deg, #FF5C39, #F43F5E)',
          borderRadius: 20, padding: 24, marginBottom: 16, color: 'white',
          boxShadow: '0 20px 40px -10px rgba(255,92,57,0.4)',
        }}>
          <div style={{ fontSize: 11, opacity: 0.9, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 700 }}>
            Order #LB{order.orderId}
          </div>
          <div style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 34, letterSpacing: '-0.03em', marginTop: 4 }}>
            {formatCurrency(grandTotal)}
          </div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 6 }}>
            🔒 Simulated payment — no real money charged
          </div>
        </div>

        {stage === 'method' && (
          <>
            <h3 style={{ fontSize: 16, marginBottom: 12, paddingLeft: 4 }}>Choose payment method</h3>

            <MethodCard
              icon={<WalletIcon size={22} />}
              gradient="linear-gradient(135deg, #7C3AED, #4F46E5)"
              title="UPI"
              subtitle="Google Pay · PhonePe · Paytm · BHIM"
              onClick={() => { setMethod('UPI'); setStage('upi-app') }}
            />

            <MethodCard
              icon={<CreditCardIcon size={22} />}
              gradient="linear-gradient(135deg, #3B82F6, #1D4ED8)"
              title="Credit / Debit Card"
              subtitle="Visa · Mastercard · RuPay"
              onClick={() => { setMethod('CARD'); setStage('card') }}
            />

            <MethodCard
              icon={<DollarSignIcon size={22} />}
              gradient="linear-gradient(135deg, #10B981, #059669)"
              title="Cash on Delivery"
              subtitle={`Pay ₹${(baseTotal + COD_FEE).toFixed(0)} at your door · +₹${COD_FEE} handling`}
              onClick={() => { setMethod('COD'); setStage('summary') }}
            />

            <div style={{
              padding: 14, background: 'rgba(59,130,246,0.08)', borderRadius: 12,
              fontSize: 12, color: '#1E40AF', lineHeight: 1.6,
              display: 'flex', gap: 10, marginTop: 20,
            }}>
              <InfoIcon size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              <div>All payments are simulated for demo purposes. No real money is processed.</div>
            </div>
          </>
        )}

        {stage === 'upi-app' && (
          <>
            <h3 style={{ fontSize: 16, marginBottom: 12, paddingLeft: 4 }}>Choose UPI app</h3>
            {UPI_APPS.map((app) => (
              <button
                key={app.id}
                onClick={() => { setUpiApp(app); setStage('upi-id') }}
                style={{
                  width: '100%', background: 'white', borderRadius: 16,
                  padding: 16, marginBottom: 10, cursor: 'pointer', textAlign: 'left',
                  border: '1px solid var(--border-1)',
                  display: 'flex', alignItems: 'center', gap: 14,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                }}
              >
                {app.logo}
                <div style={{ flex: 1, fontWeight: 700, fontSize: 15 }}>{app.name}</div>
                <div style={{
                  fontSize: 10, fontWeight: 700, color: 'var(--brand-primary)',
                  padding: '3px 8px', background: 'var(--brand-primary-light)',
                  borderRadius: 9999, letterSpacing: '0.05em',
                }}>SIMULATED</div>
              </button>
            ))}
          </>
        )}

        {stage === 'upi-id' && upiApp && (
          <>
            <div style={{
              background: 'white', borderRadius: 16, padding: 20, marginBottom: 12,
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                {upiApp.logo}
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{upiApp.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-4)' }}>Enter your UPI ID to continue</div>
                </div>
              </div>

              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 8 }}>
                Your UPI ID
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  autoFocus
                  placeholder="yourname"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value.replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 40))}
                  style={{
                    flex: 1, height: 48, padding: '0 14px',
                    border: '1.5px solid var(--border-1)', borderRadius: 12,
                    fontSize: 15, outline: 'none',
                  }}
                />
                <div style={{
                  height: 48, padding: '0 16px', borderRadius: 12,
                  background: 'var(--bg-2)', display: 'flex', alignItems: 'center',
                  fontWeight: 700, fontSize: 14, color: 'var(--text-2)', whiteSpace: 'nowrap',
                }}>{upiApp.handle}</div>
              </div>

              <div style={{
                marginTop: 16, padding: 12, background: '#EFF6FF', borderRadius: 10,
                fontSize: 12, color: '#1E40AF', display: 'flex', gap: 8,
              }}>
                <ShieldIcon size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                <div>Your UPI ID is only used to simulate the payment. Nothing is stored or sent to a real bank.</div>
              </div>
            </div>

            <Button block size="lg" disabled={!upiId.trim()} onClick={() => setStage('summary')}>
              Continue to pay {formatCurrency(grandTotal)}
            </Button>
          </>
        )}

        {stage === 'card' && (
          <div style={{
            background: 'white', borderRadius: 16, padding: 20,
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #0A0A0F, #1F2937)',
              borderRadius: 16, padding: 20, color: 'white',
              marginBottom: 20, position: 'relative', overflow: 'hidden',
              aspectRatio: '1.6',
              boxShadow: '0 12px 30px -10px rgba(0,0,0,0.4)',
            }}>
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 80% 20%, rgba(255,92,57,0.4), transparent 50%)' }} />
              <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: 11, opacity: 0.7, letterSpacing: '0.15em' }}>DEBIT / CREDIT</div>
                  {cardBrand && <CardBrandLogo brand={cardBrand} size={30} />}
                </div>
                <div style={{
                  fontFamily: 'monospace', fontSize: 20, letterSpacing: '0.15em',
                  fontWeight: 700,
                }}>
                  {(card.number || '•••• •••• •••• ••••')
                    .padEnd(19, ' ')
                    .replace(/(.{4})/g, '$1 ').trim()}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: 12 }}>
                  <div>
                    <div style={{ opacity: 0.6, fontSize: 9, letterSpacing: '0.1em' }}>CARDHOLDER</div>
                    <div style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {card.name || 'YOUR NAME'}
                    </div>
                  </div>
                  <div>
                    <div style={{ opacity: 0.6, fontSize: 9, letterSpacing: '0.1em' }}>EXPIRES</div>
                    <div style={{ fontWeight: 600 }}>{card.expiry || 'MM/YY'}</div>
                  </div>
                </div>
              </div>
            </div>

            <Input
              label="Card number"
              placeholder="1234 5678 9012 3456"
              value={card.number}
              onChange={(e) => setCard({ ...card, number: e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19) })}
            />
            <Input
              label="Cardholder name"
              placeholder="Name on card"
              value={card.name}
              onChange={(e) => setCard({ ...card, name: e.target.value })}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Input
                label="Expiry"
                placeholder="MM/YY"
                value={card.expiry}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '').slice(0, 4)
                  const formatted = v.length > 2 ? `${v.slice(0, 2)}/${v.slice(2)}` : v
                  setCard({ ...card, expiry: formatted })
                }}
              />
              <Input
                label="CVV"
                type="password"
                placeholder="•••"
                value={card.cvv}
                onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
              />
            </div>

            <Button
              block size="lg"
              disabled={card.number.replace(/\s/g, '').length < 16 || !card.name || card.expiry.length < 5 || card.cvv.length < 3}
              onClick={() => setStage('summary')}
              style={{ marginTop: 8 }}
            >
              Continue
            </Button>

            <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-4)', textAlign: 'center' }}>
              🔒 Simulated card form — no real data is stored.
            </div>
          </div>
        )}

        {stage === 'summary' && (
          <>
            <h3 style={{ fontSize: 16, marginBottom: 12, paddingLeft: 4 }}>Review your bill</h3>

            <div className="card" style={{ padding: 20, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 10 }}>
                <span style={{ color: 'var(--text-3)' }}>Item total</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 10 }}>
                <span style={{ color: 'var(--text-3)' }}>Delivery fee</span>
                <span>{formatCurrency(deliveryFee)}</span>
              </div>
              {method === 'COD' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 10 }}>
                  <span style={{ color: 'var(--text-3)' }}>COD handling fee</span>
                  <span style={{ color: '#B45309' }}>+ {formatCurrency(COD_FEE)}</span>
                </div>
              )}
              <div style={{
                paddingTop: 14, marginTop: 14,
                borderTop: '1.5px solid var(--border-1)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>To pay</span>
                <span style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 24, letterSpacing: '-0.02em' }}>
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>

            <div className="card" style={{ padding: 16, marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: 'var(--text-4)', marginBottom: 6 }}>Paying with</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontWeight: 600, fontSize: 14 }}>
                {method === 'UPI' && upiApp && (
                  <>
                    {upiApp.logo}
                    <div>
                      <div>{upiApp.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-4)', fontWeight: 400 }}>
                        {upiId}{upiApp.handle}
                      </div>
                    </div>
                  </>
                )}
                {method === 'CARD' && (
                  <>
                    {cardBrand && <CardBrandLogo brand={cardBrand} size={28} />}
                    <div>
                      <div>Card ending {card.number.replace(/\s/g, '').slice(-4)}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-4)', fontWeight: 400 }}>
                        {card.name}
                      </div>
                    </div>
                  </>
                )}
                {method === 'COD' && (
                  <>
                    <DollarSignIcon size={20} />
                    <span>Cash on Delivery</span>
                  </>
                )}
              </div>
            </div>

            <Button
              block size="lg"
              onClick={() => (method === 'COD' ? processCod() : processOnline())}
              loading={processing}
            >
              <LockIcon size={16} /> {method === 'COD' ? 'Place order' : 'Pay'} {formatCurrency(grandTotal)}
            </Button>

            <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-4)', textAlign: 'center' }}>
              By continuing you agree this is a <strong>simulated</strong> payment.
            </div>
          </>
        )}

        {stage === 'processing' && (
          <div className="card" style={{ padding: 60, textAlign: 'center', borderRadius: 20 }}>
            <div style={{
              display: 'inline-flex', padding: 20, borderRadius: 20,
              background: 'var(--brand-primary-light)', marginBottom: 24,
            }}>
              <div className="loader" style={{ width: 48, height: 48 }} />
            </div>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
              {method === 'COD' ? 'Confirming your order' : 'Processing payment'}
            </div>
            <div style={{ color: 'var(--text-3)', fontSize: 13 }}>
              Please don't close this page
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function MethodCard({ icon, gradient, title, subtitle, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', background: 'white', borderRadius: 16,
        padding: 18, marginBottom: 10, cursor: 'pointer', textAlign: 'left',
        border: '1px solid var(--border-1)',
        display: 'flex', alignItems: 'center', gap: 14,
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: gradient, color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 13, color: 'var(--text-4)' }}>{subtitle}</div>
      </div>
    </button>
  )
}