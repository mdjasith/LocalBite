import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useSeller } from '../../context/SellerContext'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import {
  StoreIcon, ClockIcon, CheckCircleIcon, XCircleIcon, RefreshIcon,
  ArrowRightIcon, LogOutIcon, MapPinIcon,
} from '../../components/icons'

export default function PendingApproval() {
  const navigate = useNavigate()
  const { email, logout } = useAuth()
  const { seller, loading, notFound, refresh, isApproved, isRejected, isBlocked } =
    useSeller()

  // Auto-redirect when approved
  useEffect(() => {
    if (isApproved) {
      navigate('/seller/dashboard', { replace: true })
    }
  }, [isApproved, navigate])

  if (loading) return <Loader />

  const handleLogout = () => {
    logout()
    navigate('/home')
  }

  const state = notFound
    ? 'NOT_REGISTERED'
    : isApproved
    ? 'APPROVED'
    : isRejected
    ? 'REJECTED'
    : isBlocked
    ? 'BLOCKED'
    : 'PENDING'

  const config = {
    NOT_REGISTERED: {
      icon: <StoreIcon size={56} />,
      color: 'var(--brand-primary)',
      bg: 'var(--brand-primary-light)',
      title: 'Finish setting up your store',
      message:
        'Your account is created but you haven’t submitted your store details yet. Add your store name, owner, and location to continue.',
      showSetup: true,
    },
    PENDING: {
      icon: <ClockIcon size={56} />,
      color: '#B45309',
      bg: 'var(--warning-bg)',
      title: 'Waiting for admin approval',
      message:
        'Your store application has been submitted. An admin will review it shortly. You will be able to receive orders once approved.',
      showSetup: false,
    },
    REJECTED: {
      icon: <XCircleIcon size={56} />,
      color: 'var(--danger)',
      bg: 'var(--danger-bg)',
      title: 'Application rejected',
      message:
        'Your store application was rejected by the admin. Please contact support or update your details and try again.',
      showSetup: true,
    },
    BLOCKED: {
      icon: <XCircleIcon size={56} />,
      color: 'var(--danger)',
      bg: 'var(--danger-bg)',
      title: 'Account blocked',
      message:
        'Your seller account has been blocked. Please contact the platform admin for more information.',
      showSetup: false,
    },
    APPROVED: {
      icon: <CheckCircleIcon size={56} />,
      color: 'var(--success)',
      bg: 'var(--success-bg)',
      title: 'You’re approved!',
      message: 'Redirecting to your dashboard...',
      showSetup: false,
    },
  }[state]

  return (
    <div
      className="page"
      style={{
        minHeight: 'calc(100vh - var(--navbar-h))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 24px',
        background: 'linear-gradient(180deg, #FFF5F0 0%, #FAFAFB 100%)',
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: 560,
          width: '100%',
          padding: 48,
          textAlign: 'center',
          borderRadius: 'var(--r-2xl)',
        }}
      >
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: '50%',
            background: config.bg,
            color: config.color,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
          }}
        >
          {config.icon}
        </div>

        <h1 style={{ fontSize: 28, marginBottom: 12, letterSpacing: '-0.03em' }}>
          {config.title}
        </h1>

        <p
          style={{
            color: 'var(--text-3)',
            fontSize: 15,
            lineHeight: 1.7,
            marginBottom: 32,
          }}
        >
          {config.message}
        </p>

        {state === 'PENDING' && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 18px',
              background: 'var(--warning-bg)',
              borderRadius: 9999,
              fontSize: 13,
              fontWeight: 600,
              color: '#B45309',
              marginBottom: 32,
            }}
          >
            <ClockIcon size={14} />
            Status: Waiting for approval
          </div>
        )}

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            maxWidth: 320,
            margin: '0 auto',
          }}
        >
          <Button
            variant="outline"
            onClick={refresh}
            disabled={loading}
            block
          >
            <RefreshIcon size={16} /> Check status again
          </Button>

          {config.showSetup && (
            <Button onClick={() => navigate('/seller/register')} block>
              <StoreIcon size={16} /> Setup store
            </Button>
          )}

          <Button variant="ghost" onClick={handleLogout} block>
            <LogOutIcon size={16} /> Logout
          </Button>
        </div>

        <div
          style={{
            marginTop: 32,
            paddingTop: 24,
            borderTop: '1px solid var(--border-2)',
            fontSize: 12,
            color: 'var(--text-4)',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <MapPinIcon size={12} />
            <span>Signed in as</span>
          </div>
          <div style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-2)' }}>
            {email}
          </div>
        </div>
      </div>
    </div>
  )
}