import { useNavigate, useLocation } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { CartIcon, ArrowRightIcon } from '../icons'
import { formatCurrencyShort } from '../../utils/formatCurrency'

export default function BottomCartBar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { itemCount, subtotal, canUseCart } = useCart()
  const { isAuthenticated } = useAuth()

  const hidden =
    !isAuthenticated ||
    !canUseCart ||
    itemCount === 0 ||
    pathname === '/cart' ||
    pathname === '/checkout' ||
    pathname.startsWith('/payment/') ||
    pathname.startsWith('/order-success/')

  if (hidden) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 90,
        width: 'calc(100% - 40px)',
        maxWidth: 560,
        animation: 'slideInRight 400ms var(--ease-spring)',
      }}
    >
      <div
        onClick={() => navigate('/cart')}
        style={{
          background: 'var(--gradient-primary)',
          borderRadius: 20,
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          boxShadow: '0 20px 40px -10px rgba(255,92,57,0.5)',
          cursor: 'pointer',
          color: 'white',
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <CartIcon size={22} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: 'Plus Jakarta Sans',
              fontWeight: 800,
              fontSize: 17,
              letterSpacing: '-0.01em',
            }}
          >
            {itemCount} item{itemCount !== 1 ? 's' : ''} · {formatCurrencyShort(subtotal)}
          </div>
          <div
            style={{
              fontSize: 12,
              opacity: 0.9,
              marginTop: 2,
            }}
          >
            Tap to view cart
          </div>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          View <ArrowRightIcon size={16} />
        </div>
      </div>
    </div>
  )
}