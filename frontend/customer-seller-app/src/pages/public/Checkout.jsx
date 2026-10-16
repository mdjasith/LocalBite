import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { listAddresses, addAddress } from '../../api/userApi'
import { placeOrder } from '../../api/orderApi'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Loader from '../../components/common/Loader'
import {
  MapPinIcon, PlusIcon, CheckIcon, ArrowRightIcon, HomeIcon,
} from '../../components/icons'
import { formatCurrency } from '../../utils/formatCurrency'
import { extractError } from '../../api/axiosClient'

export default function Checkout() {
  const navigate = useNavigate()
  const { userId } = useAuth()
  const { sellerGroups, subtotal, itemCount, refresh } = useCart()
  const [addresses, setAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [placing, setPlacing] = useState(false)
  const [form, setForm] = useState({
    addressTitle: 'Home',
    addressLine: '',
    city: 'Chennai',
    state: 'Tamil Nadu',
    postalCode: '',
    latitude: 12.9716,
    longitude: 80.2447,
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    ;(async () => {
      try {
        const list = await listAddresses(userId)
        setAddresses(list || [])
        const def = (list || []).find((a) => a.isDefault)
        setSelectedAddress(def?.addressId || list?.[0]?.addressId || null)
      } catch {
        setAddresses([])
      } finally {
        setLoading(false)
      }
    })()
  }, [userId])

  const deliveryFeeTotal = sellerGroups.length * 30
  const grandTotal = Number(subtotal) + deliveryFeeTotal

  const handleAddAddress = async (e) => {
    e.preventDefault()
    const next = {}
    if (!form.addressLine) next.addressLine = 'Address required'
    if (!form.city) next.city = 'City required'
    if (Object.keys(next).length) {
      setErrors(next)
      return
    }
    try {
      const created = await addAddress(userId, form)
      const list = await listAddresses(userId)
      setAddresses(list || [])
      setSelectedAddress(created.addressId)
      setShowAddForm(false)
      setForm({ ...form, addressLine: '', postalCode: '' })
      toast.success('Address added')
    } catch (err) {
      toast.error(extractError(err))
    }
  }

  const handlePlaceOrder = async () => {
    const addr = addresses.find((a) => a.addressId === selectedAddress)
    if (!addr) {
      toast.error('Please select or add a delivery address')
      return
    }
    setPlacing(true)
    try {
      const fullAddress = `${addr.addressLine}, ${addr.city}, ${addr.state}${addr.postalCode ? ' - ' + addr.postalCode : ''}`
      const orders = await placeOrder({
        deliveryAddress: fullAddress,
        deliveryLatitude: addr.latitude,
        deliveryLongitude: addr.longitude,
      })
      await refresh()
      toast.success(`${orders.length} order${orders.length > 1 ? 's' : ''} placed!`)
      if (orders.length > 0) {
        navigate(`/payment/${orders[0].orderId}`)
      } else {
        navigate('/home')
      }
    } catch (err) {
      toast.error(extractError(err))
    } finally {
      setPlacing(false)
    }
  }

  if (loading) return <Loader />

  if (itemCount === 0) {
    return (
      <div className="page container" style={{ padding: 80, textAlign: 'center' }}>
        <h2 style={{ marginBottom: 16 }}>Your cart is empty</h2>
        <Button onClick={() => navigate('/foods')}>Browse food</Button>
      </div>
    )
  }

  return (
    <div className="page container" style={{ padding: '40px 24px 80px', maxWidth: 960 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, marginBottom: 8 }}>Checkout</h1>
        <p style={{ color: 'var(--text-3)', fontSize: 15 }}>
          Confirm your address and place the order.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 340px',
          gap: 24,
          alignItems: 'start',
        }}
      >
        {/* LEFT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 20,
              }}
            >
              <MapPinIcon size={20} color="var(--brand-primary)" />
              <h3 style={{ fontSize: 18, margin: 0 }}>Delivery address</h3>
            </div>

            {addresses.length === 0 && !showAddForm && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <p style={{ color: 'var(--text-3)', marginBottom: 16 }}>
                  No addresses saved yet.
                </p>
                <Button onClick={() => setShowAddForm(true)}>
                  <PlusIcon size={16} /> Add your first address
                </Button>
              </div>
            )}

            {addresses.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {addresses.map((a) => (
                  <div
                    key={a.addressId}
                    onClick={() => setSelectedAddress(a.addressId)}
                    style={{
                      padding: 16,
                      borderRadius: 'var(--r-md)',
                      border:
                        selectedAddress === a.addressId
                          ? '1.5px solid var(--brand-primary)'
                          : '1.5px solid var(--border-1)',
                      background:
                        selectedAddress === a.addressId
                          ? 'var(--brand-primary-light)'
                          : 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      gap: 12,
                      alignItems: 'flex-start',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background:
                          selectedAddress === a.addressId
                            ? 'var(--gradient-primary)'
                            : 'var(--bg-2)',
                        color:
                          selectedAddress === a.addressId
                            ? 'white'
                            : 'var(--text-3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <HomeIcon size={16} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          marginBottom: 4,
                        }}
                      >
                        <strong style={{ fontSize: 14 }}>{a.addressTitle}</strong>
                        {a.isDefault && (
                          <span className="badge badge--approved">Default</span>
                        )}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.5 }}>
                        {a.addressLine}, {a.city}, {a.state}
                        {a.postalCode ? ` - ${a.postalCode}` : ''}
                      </div>
                    </div>
                    {selectedAddress === a.addressId && (
                      <CheckIcon size={18} color="var(--brand-primary)" />
                    )}
                  </div>
                ))}

                {!showAddForm && (
                  <button
                    onClick={() => setShowAddForm(true)}
                    style={{
                      padding: 14,
                      border: '1.5px dashed var(--border-1)',
                      borderRadius: 'var(--r-md)',
                      background: 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      fontSize: 14,
                      fontWeight: 600,
                      color: 'var(--text-3)',
                    }}
                  >
                    <PlusIcon size={16} /> Add new address
                  </button>
                )}
              </div>
            )}

            {showAddForm && (
              <form
                onSubmit={handleAddAddress}
                style={{
                  marginTop: 16,
                  padding: 20,
                  border: '1.5px solid var(--border-1)',
                  borderRadius: 'var(--r-md)',
                  background: 'var(--bg-0)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                }}
              >
                <Input
                  label="Address title"
                  value={form.addressTitle}
                  onChange={(e) => setForm({ ...form, addressTitle: e.target.value })}
                  placeholder="Home, Office..."
                />
                <Input
                  label="Address line"
                  value={form.addressLine}
                  onChange={(e) => setForm({ ...form, addressLine: e.target.value })}
                  error={errors.addressLine}
                  placeholder="Street, area, landmark"
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Input
                    label="City"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    error={errors.city}
                  />
                  <Input
                    label="State"
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                  />
                </div>
                <Input
                  label="Postal code"
                  value={form.postalCode}
                  onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                  placeholder="600096"
                />
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <Button type="button" variant="ghost" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" style={{ flex: 1 }}>
                    Save address
                  </Button>
                </div>
              </form>
            )}
          </div>

          <div className="card">
            <h3 style={{ fontSize: 18, marginBottom: 16 }}>Order items</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {sellerGroups.flatMap((g) =>
                g.items.map((i) => (
                  <div
                    key={i.cartItemId}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 14,
                    }}
                  >
                    <span style={{ color: 'var(--text-2)' }}>
                      {i.foodName} × {i.quantity}
                    </span>
                    <span style={{ fontWeight: 600 }}>{formatCurrency(i.lineTotal)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT — summary */}
        <div className="card" style={{ position: 'sticky', top: 96 }}>
          <h3 style={{ fontSize: 18, marginBottom: 20 }}>Order summary</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: 'var(--text-2)' }}>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: 'var(--text-2)' }}>
                Delivery ({sellerGroups.length} seller
                {sellerGroups.length > 1 ? 's' : ''})
              </span>
              <span>{formatCurrency(deliveryFeeTotal)}</span>
            </div>
          </div>

          <div
            style={{
              paddingTop: 16,
              borderTop: '1px solid var(--border-2)',
              marginBottom: 20,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 16 }}>Total</span>
            <span
              style={{
                fontWeight: 800,
                fontSize: 24,
                fontFamily: 'Plus Jakarta Sans',
                letterSpacing: '-0.02em',
              }}
            >
              {formatCurrency(grandTotal)}
            </span>
          </div>

          <Button
            size="lg"
            block
            onClick={handlePlaceOrder}
            loading={placing}
            disabled={!selectedAddress}
          >
            Place order <ArrowRightIcon size={16} />
          </Button>

          <div
            style={{
              marginTop: 16,
              padding: 12,
              borderRadius: 'var(--r-sm)',
              background: 'var(--warning-bg)',
              fontSize: 12,
              color: '#B45309',
              textAlign: 'center',
              lineHeight: 1.5,
            }}
          >
            ⚠️ Simulated payment. No real money.
          </div>
        </div>
      </div>
    </div>
  )
}