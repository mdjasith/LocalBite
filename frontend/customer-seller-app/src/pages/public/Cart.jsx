import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import Button from '../../components/common/Button'
import EmptyState from '../../components/common/EmptyState'
import {
  CartIcon, PlusIcon, MinusIcon, TrashIcon, StoreIcon, ArrowRightIcon,
} from '../../components/icons'
import { formatCurrency } from '../../utils/formatCurrency'

export default function Cart() {
  const navigate = useNavigate()
  const { isAuthenticated, role } = useAuth()
  const {
    sellerGroups,
    itemCount,
    subtotal,
    updateQuantity,
    removeItem,
    clear,
  } = useCart()

  const isCustomer = isAuthenticated && role === 'CUSTOMER'

  // Not logged in
  if (!isCustomer) {
    return (
      <div className="page container" style={{ padding: '80px 24px' }}>
        <EmptyState
          icon={<CartIcon size={40} />}
          title="Login to see your cart"
          text="Cart items are saved to your account."
          action={
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button onClick={() => navigate('/login')}>Login</Button>
              <Button variant="outline" onClick={() => navigate('/register')}>
                Create account
              </Button>
            </div>
          }
        />
      </div>
    )
  }

  // Logged in but empty cart
  if (itemCount === 0) {
    return (
      <div className="page container" style={{ padding: '80px 24px' }}>
        <EmptyState
          icon={<CartIcon size={40} />}
          title="Your cart is empty"
          text="Browse our dishes and add something you like."
          action={
            <Button onClick={() => navigate('/foods')}>
              Browse food <ArrowRightIcon size={16} />
            </Button>
          }
        />
      </div>
    )
  }

  const handleRemove = async (id) => {
    try {
      await removeItem(id)
      toast.success('Item removed')
    } catch {
      toast.error('Could not remove')
    }
  }

  const handleQty = async (id, q) => {
    if (q < 1) return
    try {
      await updateQuantity(id, q)
    } catch {
      toast.error('Could not update')
    }
  }

  return (
    <div className="page container" style={{ padding: '40px 24px 80px', maxWidth: 900 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, marginBottom: 8 }}>Your cart</h1>
        <p style={{ color: 'var(--text-3)', fontSize: 15 }}>
          {itemCount} item{itemCount !== 1 ? 's' : ''} from {sellerGroups.length} seller
          {sellerGroups.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          marginBottom: 32,
        }}
      >
        {sellerGroups.map((group) => (
          <div
            key={group.sellerId}
            className="card"
            style={{ padding: 0, overflow: 'hidden' }}
          >
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--border-2)',
                background: 'var(--bg-2)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <StoreIcon size={16} color="var(--brand-primary)" />
              <span style={{ fontWeight: 700, fontSize: 14 }}>
                Seller #{group.sellerId}
              </span>
              <button
                onClick={() => navigate(`/sellers/${group.sellerId}`)}
                style={{
                  marginLeft: 'auto',
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--brand-primary)',
                  cursor: 'pointer',
                }}
              >
                View store
              </button>
            </div>

            {group.items.map((item) => (
              <div
                key={item.cartItemId}
                style={{
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  borderBottom: '1px solid var(--border-2)',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 15,
                      marginBottom: 4,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item.foodName}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-4)' }}>
                    {formatCurrency(item.price)} each
                  </div>
                </div>

                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '6px 10px',
                    border: '1.5px solid var(--border-1)',
                    borderRadius: 'var(--r-sm)',
                    background: 'white',
                  }}
                >
                  <button
                    onClick={() => handleQty(item.cartItemId, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    style={{ display: 'flex', cursor: 'pointer' }}
                  >
                    <MinusIcon size={14} />
                  </button>
                  <span
                    style={{
                      fontWeight: 700,
                      minWidth: 20,
                      textAlign: 'center',
                      fontSize: 14,
                    }}
                  >
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleQty(item.cartItemId, item.quantity + 1)}
                    style={{ display: 'flex', cursor: 'pointer' }}
                  >
                    <PlusIcon size={14} />
                  </button>
                </div>

                <div
                  style={{
                    fontWeight: 700,
                    fontFamily: 'Plus Jakarta Sans',
                    fontSize: 16,
                    minWidth: 70,
                    textAlign: 'right',
                  }}
                >
                  {formatCurrency(item.lineTotal)}
                </div>

                <button
                  onClick={() => handleRemove(item.cartItemId)}
                  style={{ color: 'var(--danger)', cursor: 'pointer', padding: 6 }}
                  title="Remove"
                >
                  <TrashIcon size={16} />
                </button>
              </div>
            ))}

            <div
              style={{
                padding: '12px 20px',
                textAlign: 'right',
                fontSize: 14,
                color: 'var(--text-2)',
              }}
            >
              Seller subtotal:{' '}
              <strong style={{ color: 'var(--text-1)' }}>
                {formatCurrency(group.sellerSubtotal)}
              </strong>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 24 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 8,
            fontSize: 15,
            color: 'var(--text-2)',
          }}
        >
          <span>Items</span>
          <span>{itemCount}</span>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 20,
            paddingTop: 16,
            borderTop: '1px solid var(--border-2)',
          }}
        >
          <span style={{ fontWeight: 700, fontSize: 16 }}>Subtotal</span>
          <span
            style={{
              fontWeight: 800,
              fontSize: 22,
              fontFamily: 'Plus Jakarta Sans',
            }}
          >
            {formatCurrency(subtotal)}
          </span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-4)', marginBottom: 20 }}>
          Delivery fee (₹30 per seller) and totals calculated at checkout.
        </div>
        <Button size="lg" block onClick={() => navigate('/checkout')}>
          Proceed to checkout <ArrowRightIcon size={18} />
        </Button>
        <button
          onClick={clear}
          style={{
            display: 'block',
            margin: '16px auto 0',
            color: 'var(--text-3)',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Clear cart
        </button>
      </div>
    </div>
  )
}