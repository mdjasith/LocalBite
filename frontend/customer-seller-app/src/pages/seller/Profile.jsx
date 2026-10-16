import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useSeller } from '../../context/SellerContext'
import { updateSeller, setSellerLocation, getSellerLocation } from '../../api/sellerApi'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Loader from '../../components/common/Loader'
import { MapPinIcon, StoreIcon, CheckIcon } from '../../components/icons'
import { extractError } from '../../api/axiosClient'

export default function Profile() {
  const { seller, refresh } = useSeller()
  const [form, setForm] = useState({
    storeName: '',
    ownerName: '',
    phoneNumber: '',
    storeDescription: '',
  })
  const [location, setLocation] = useState({
    addressLine: '',
    city: '',
    state: '',
    postalCode: '',
    latitude: 12.9716,
    longitude: 80.2447,
  })
  const [hasLocation, setHasLocation] = useState(false)
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingLocation, setSavingLocation] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        if (seller) {
          setForm({
            storeName: seller.storeName || '',
            ownerName: seller.ownerName || '',
            phoneNumber: seller.phoneNumber || '',
            storeDescription: seller.storeDescription || '',
          })
          const loc = await getSellerLocation(seller.sellerId).catch(() => null)
          if (loc) {
            setLocation({
              addressLine: loc.addressLine || '',
              city: loc.city || '',
              state: loc.state || '',
              postalCode: loc.postalCode || '',
              latitude: loc.latitude || 12.9716,
              longitude: loc.longitude || 80.2447,
            })
            setHasLocation(true)
          }
        }
      } finally {
        setLoading(false)
      }
    })()
  }, [seller])

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      await updateSeller(seller.sellerId, form)
      await refresh()
      toast.success('Store updated')
    } catch (err) {
      toast.error(extractError(err))
    } finally {
      setSavingProfile(false)
    }
  }

  const handleSaveLocation = async (e) => {
    e.preventDefault()
    setSavingLocation(true)
    try {
      await setSellerLocation(seller.sellerId, location)
      setHasLocation(true)
      toast.success('Location saved')
    } catch (err) {
      toast.error(extractError(err))
    } finally {
      setSavingLocation(false)
    }
  }

  if (loading) return <Loader />

  return (
    <div className="page container" style={{ padding: '40px 24px 80px', maxWidth: 720 }}>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>Store profile</h1>
      <p style={{ color: 'var(--text-3)', fontSize: 15, marginBottom: 32 }}>
        Update your store information and location.
      </p>

      {/* Profile form */}
      <form
        onSubmit={handleSaveProfile}
        className="card"
        style={{ padding: 28, marginBottom: 20 }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 24,
          }}
        >
          <StoreIcon size={20} color="var(--brand-primary)" />
          <h3 style={{ fontSize: 18, margin: 0 }}>Store information</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input
            label="Store name"
            value={form.storeName}
            onChange={(e) => setForm({ ...form, storeName: e.target.value })}
          />
          <Input
            label="Owner name"
            value={form.ownerName}
            onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
          />
          <Input
            label="Phone number"
            value={form.phoneNumber}
            onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
          />
          <Input
            label="Description"
            as="textarea"
            rows={3}
            value={form.storeDescription}
            onChange={(e) =>
              setForm({ ...form, storeDescription: e.target.value })
            }
          />
          <Button type="submit" loading={savingProfile}>
            <CheckIcon size={16} /> Save changes
          </Button>
        </div>
      </form>

      {/* Location form */}
      <form
        onSubmit={handleSaveLocation}
        className="card"
        style={{ padding: 28 }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 24,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <MapPinIcon size={20} color="var(--brand-primary)" />
            <h3 style={{ fontSize: 18, margin: 0 }}>Store location</h3>
          </div>
          {hasLocation && (
            <span className="badge badge--approved">Location set</span>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input
            label="Address line"
            value={location.addressLine}
            onChange={(e) =>
              setLocation({ ...location, addressLine: e.target.value })
            }
            placeholder="Street, area"
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input
              label="City"
              value={location.city}
              onChange={(e) => setLocation({ ...location, city: e.target.value })}
            />
            <Input
              label="State"
              value={location.state}
              onChange={(e) => setLocation({ ...location, state: e.target.value })}
            />
          </div>
          <Input
            label="Postal code"
            value={location.postalCode}
            onChange={(e) =>
              setLocation({ ...location, postalCode: e.target.value })
            }
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input
              label="Latitude"
              type="number"
              step="0.0000001"
              value={location.latitude}
              onChange={(e) =>
                setLocation({ ...location, latitude: Number(e.target.value) })
              }
            />
            <Input
              label="Longitude"
              type="number"
              step="0.0000001"
              value={location.longitude}
              onChange={(e) =>
                setLocation({ ...location, longitude: Number(e.target.value) })
              }
            />
          </div>
          <Button type="submit" loading={savingLocation}>
            <CheckIcon size={16} /> Save location
          </Button>
        </div>
      </form>
    </div>
  )
}