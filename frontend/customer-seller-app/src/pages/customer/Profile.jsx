import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import {
  getProfile, createProfile, updateProfile,
  listAddresses, addAddress, deleteAddress,
} from '../../api/userApi'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Loader from '../../components/common/Loader'
import ConfirmModal from '../../components/common/ConfirmModal'
import {
  UserIcon, MapPinIcon, PlusIcon, TrashIcon, CheckIcon,
  HomeIcon, LogOutIcon, MailIcon, PackageIcon, ArrowRightIcon,
  PhoneIcon, EditIcon, XIcon,
} from '../../components/icons'
import { extractError } from '../../api/axiosClient'

export default function Profile() {
  const navigate = useNavigate()
  const { userId, email, logout } = useAuth()

  const [profile, setProfile] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [addingAddress, setAddingAddress] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const [profileForm, setProfileForm] = useState({ fullName: '', phoneNumber: '', profileImageUrl: '' })
  const [addressForm, setAddressForm] = useState({
    addressTitle: 'Home', addressLine: '', city: 'Chennai', state: 'Tamil Nadu',
    postalCode: '', latitude: 12.9716, longitude: 80.2447, isDefault: false,
  })
  const [profileErrors, setProfileErrors] = useState({})
  const [addressErrors, setAddressErrors] = useState({})

  const load = async () => {
    try {
      setLoading(true)
      try {
        const p = await getProfile(userId)
        setProfile(p)
        setProfileForm({
          fullName: p.fullName || '',
          phoneNumber: p.phoneNumber || '',
          profileImageUrl: p.profileImageUrl || '',
        })
      } catch {
        setProfile(null)
        setEditMode(true)
      }
      try {
        const list = await listAddresses(userId)
        setAddresses(Array.isArray(list) ? list : [])
      } catch { setAddresses([]) }
    } finally { setLoading(false) }
  }

  useEffect(() => { if (userId) load() /* eslint-disable-next-line */ }, [userId])

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    const next = {}
    if (!profileForm.fullName.trim()) next.fullName = 'Name required'
    if (Object.keys(next).length) { setProfileErrors(next); return }
    setSavingProfile(true)
    try {
      if (profile) {
        await updateProfile(userId, profileForm)
        toast.success('Profile updated')
      } else {
        await createProfile(userId, profileForm)
        toast.success('Profile created')
      }
      setEditMode(false)
      await load()
    } catch (err) { toast.error(extractError(err)) }
    finally { setSavingProfile(false) }
  }

  const handleCancelEdit = () => {
    if (profile) {
      setProfileForm({
        fullName: profile.fullName || '',
        phoneNumber: profile.phoneNumber || '',
        profileImageUrl: profile.profileImageUrl || '',
      })
      setProfileErrors({})
      setEditMode(false)
    }
  }

  const handleAddAddress = async (e) => {
    e.preventDefault()
    const next = {}
    if (!addressForm.addressLine.trim()) next.addressLine = 'Address required'
    if (!addressForm.city.trim()) next.city = 'City required'
    if (Object.keys(next).length) { setAddressErrors(next); return }
    setAddingAddress(true)
    try {
      await addAddress(userId, addressForm)
      toast.success('Address added')
      setShowAddForm(false)
      setAddressForm({ addressTitle: 'Home', addressLine: '', city: 'Chennai', state: 'Tamil Nadu', postalCode: '', latitude: 12.9716, longitude: 80.2447, isDefault: false })
      await load()
    } catch (err) { toast.error(extractError(err)) }
    finally { setAddingAddress(false) }
  }

  const handleDeleteAddress = async () => {
    if (!confirmDelete) return
    try {
      await deleteAddress(userId, confirmDelete)
      toast.success('Address removed')
      setConfirmDelete(null)
      await load()
    } catch (err) { toast.error(extractError(err)) }
  }

  const handleLogout = () => { logout(); navigate('/home') }

  if (loading) return <Loader />

  const initial = (profile?.fullName || email || 'U')[0].toUpperCase()
  const displayName = profile?.fullName || 'Set your name'

  return (
    <div className="page container" style={{ padding: '40px 24px 80px', maxWidth: 720 }}>
      {/* HEADER CARD */}
      <div className="card" style={{
        padding: 28, marginBottom: 20,
        background: 'linear-gradient(135deg, #FFF5F0 0%, white 100%)',
        display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'var(--gradient-primary)', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 28,
          boxShadow: 'var(--shadow-brand)', flexShrink: 0, overflow: 'hidden',
        }}>
          {profile?.profileImageUrl ? (
            <img src={profile.profileImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : initial}
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h1 style={{ fontSize: 24, marginBottom: 6 }}>{displayName}</h1>
          <div style={{ fontSize: 14, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <MailIcon size={14} /> {email}
          </div>
          {profile?.phoneNumber && (
            <div style={{ fontSize: 14, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <PhoneIcon size={14} /> {profile.phoneNumber}
            </div>
          )}
        </div>
        <Button variant="outline" onClick={handleLogout}>
          <LogOutIcon size={16} /> Logout
        </Button>
      </div>

      {/* QUICK ACTIONS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        <button onClick={() => navigate('/orders')} className="card card--hover"
          style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', textAlign: 'left' }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'var(--gradient-primary)', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <PackageIcon size={20} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>My Orders</div>
            <div style={{ fontSize: 12, color: 'var(--text-4)' }}>Track & manage orders</div>
          </div>
          <ArrowRightIcon size={16} color="var(--text-4)" />
        </button>

        <button onClick={() => navigate('/customer/location')} className="card card--hover"
          style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', textAlign: 'left' }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <MapPinIcon size={20} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Location</div>
            <div style={{ fontSize: 12, color: 'var(--text-4)' }}>Set delivery area</div>
          </div>
          <ArrowRightIcon size={16} color="var(--text-4)" />
        </button>
      </div>

      {/* PERSONAL DETAILS — VIEW MODE */}
      {!editMode && profile && (
        <div className="card" style={{ padding: 28, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <UserIcon size={20} color="var(--brand-primary)" />
              <h3 style={{ fontSize: 18, margin: 0 }}>Personal details</h3>
            </div>
            <Button size="sm" variant="outline" onClick={() => setEditMode(true)}>
              <EditIcon size={14} /> Edit
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <InfoRow icon={<UserIcon size={16} />} label="Full name" value={profile.fullName || '—'} />
            <InfoRow icon={<PhoneIcon size={16} />} label="Phone number" value={profile.phoneNumber || '—'} />
            <InfoRow icon={<MailIcon size={16} />} label="Email" value={email} />
          </div>
        </div>
      )}

      {/* PERSONAL DETAILS — EDIT MODE */}
      {editMode && (
        <form onSubmit={handleSaveProfile} className="card" style={{ padding: 28, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <UserIcon size={20} color="var(--brand-primary)" />
              <h3 style={{ fontSize: 18, margin: 0 }}>{profile ? 'Edit personal details' : 'Complete your profile'}</h3>
            </div>
            {profile && (
              <button type="button" onClick={handleCancelEdit}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--text-3)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                <XIcon size={14} /> Cancel
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input label="Full name" value={profileForm.fullName}
              onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
              error={profileErrors.fullName} placeholder="Enter your full name" />
            <Input label="Phone number" type="tel" value={profileForm.phoneNumber}
              onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value.replace(/[^\d+\-\s]/g, '').slice(0, 16) })}
              placeholder="9000000001" />
            <Input label="Profile image URL (optional)" value={profileForm.profileImageUrl}
              onChange={(e) => setProfileForm({ ...profileForm, profileImageUrl: e.target.value })}
              placeholder="https://..." />
            <Button type="submit" loading={savingProfile}>
              <CheckIcon size={16} /> {profile ? 'Save changes' : 'Create profile'}
            </Button>
          </div>
        </form>
      )}

      {/* ADDRESSES */}
      <div className="card" style={{ padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <MapPinIcon size={20} color="var(--brand-primary)" />
            <h3 style={{ fontSize: 18, margin: 0 }}>Delivery addresses</h3>
          </div>
          {!showAddForm && (
            <Button size="sm" onClick={() => setShowAddForm(true)}>
              <PlusIcon size={14} /> Add
            </Button>
          )}
        </div>

        {addresses.length === 0 && !showAddForm && (
          <div style={{ padding: 20, background: 'var(--bg-2)', borderRadius: 'var(--r-md)', textAlign: 'center', fontSize: 14, color: 'var(--text-3)' }}>
            No addresses yet. Add one to start ordering.
          </div>
        )}

        {addresses.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: showAddForm ? 20 : 0 }}>
            {addresses.map((a) => (
              <div key={a.addressId} style={{ padding: 16, borderRadius: 'var(--r-md)', border: '1.5px solid var(--border-1)', background: 'white', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--brand-primary-light)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <HomeIcon size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <strong style={{ fontSize: 14 }}>{a.addressTitle}</strong>
                    {a.isDefault && <span className="badge badge--approved">Default</span>}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.5 }}>
                    {a.addressLine}, {a.city}, {a.state}{a.postalCode ? ` - ${a.postalCode}` : ''}
                  </div>
                </div>
                <button onClick={() => setConfirmDelete(a.addressId)} style={{ color: 'var(--danger)', cursor: 'pointer', padding: 6 }}>
                  <TrashIcon size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {showAddForm && (
          <form onSubmit={handleAddAddress} style={{ padding: 20, border: '1.5px solid var(--border-1)', borderRadius: 'var(--r-md)', background: 'var(--bg-0)', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input label="Label" value={addressForm.addressTitle}
              onChange={(e) => setAddressForm({ ...addressForm, addressTitle: e.target.value })}
              placeholder="Home, Office..." />
            <Input label="Address line" value={addressForm.addressLine}
              onChange={(e) => setAddressForm({ ...addressForm, addressLine: e.target.value })}
              error={addressErrors.addressLine} placeholder="Street, area, landmark" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Input label="City" value={addressForm.city}
                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                error={addressErrors.city} />
              <Input label="State" value={addressForm.state}
                onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} />
            </div>
            <Input label="Postal code" value={addressForm.postalCode}
              onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
              placeholder="600096" />
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, cursor: 'pointer' }}>
              <input type="checkbox" checked={addressForm.isDefault}
                onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })} />
              Set as default address
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              <Button type="button" variant="ghost" onClick={() => setShowAddForm(false)}>Cancel</Button>
              <Button type="submit" loading={addingAddress} style={{ flex: 1 }}>Save address</Button>
            </div>
          </form>
        )}
      </div>

      <ConfirmModal
        open={!!confirmDelete}
        title="Delete this address?"
        message="You can add it again later."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDeleteAddress}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  )
}

function InfoRow({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: 'var(--bg-2)', borderRadius: 'var(--r-md)' }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, background: 'white',
        color: 'var(--brand-primary)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)', wordBreak: 'break-word' }}>{value}</div>
      </div>
    </div>
  )
}