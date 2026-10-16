import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/common/Button'
import { CheckCircleIcon, ArrowRightIcon, PackageIcon } from '../../components/icons'

export default function PaymentSuccess() {
  const { orderId } = useParams()
  const navigate = useNavigate()

  return (
    <div
      className="page"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 24px',
        minHeight: 'calc(100vh - var(--navbar-h))',
      }}
    >
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: 'var(--gradient-success)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 20px 60px -10px rgba(16,185,129,0.5)',
            marginBottom: 32,
            animation: 'successPop 600ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <CheckCircleIcon size={60} />
        </div>

        <h1
          style={{
            fontSize: 36,
            letterSpacing: '-0.03em',
            marginBottom: 12,
            animation: 'fadeInUp 600ms 200ms backwards',
          }}
        >
          Order confirmed!
        </h1>

        <p
          style={{
            fontSize: 16,
            color: 'var(--text-3)',
            marginBottom: 12,
            lineHeight: 1.6,
            animation: 'fadeInUp 600ms 300ms backwards',
          }}
        >
          Your simulated payment was successful. The seller has been notified
          and will start preparing your food.
        </p>

        <div
          style={{
            display: 'inline-block',
            padding: '8px 16px',
            background: 'var(--success-bg)',
            borderRadius: 9999,
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--success)',
            letterSpacing: '0.05em',
            marginBottom: 32,
            animation: 'fadeInUp 600ms 400ms backwards',
          }}
        >
          ✓ SIMULATED PAYMENT
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            animation: 'fadeInUp 600ms 500ms backwards',
          }}
        >
          <Button size="lg" block onClick={() => navigate(`/orders/${orderId}`)}>
            <PackageIcon size={18} /> Track your order
          </Button>
          <Button size="lg" variant="ghost" block onClick={() => navigate('/foods')}>
            Continue shopping <ArrowRightIcon size={16} />
          </Button>
        </div>
      </div>
    </div>
  )
}