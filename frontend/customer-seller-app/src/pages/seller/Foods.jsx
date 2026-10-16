import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useSeller } from '../../context/SellerContext'
import {
  foodsBySeller,
  deleteFood,
  toggleAvailability,
} from '../../api/foodApi'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import EmptyState from '../../components/common/EmptyState'
import ConfirmModal from '../../components/common/ConfirmModal'
import {
  PlusIcon, EditIcon, TrashIcon, UtensilsIcon, FlameIcon, LeafIcon,
  ClockIcon, CheckIcon, XIcon,
} from '../../components/icons'
import { formatCurrencyShort } from '../../utils/formatCurrency'
import { extractError } from '../../api/axiosClient'

const IMG_POOL = [
  'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80',
  'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&q=80',
  'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&q=80',
  'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&q=80',
]

function pickImage(seed) {
  const idx =
    Number(String(seed || '0').split('').reduce((a, c) => a + c.charCodeAt(0), 0)) %
    IMG_POOL.length
  return IMG_POOL[idx]
}

export default function SellerFoods() {
  const navigate = useNavigate()
  const { seller } = useSeller()
  const [foods, setFoods] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const load = async () => {
    if (!seller) return
    try {
      setLoading(true)
      const data = await foodsBySeller(seller.sellerId)
      setFoods(Array.isArray(data) ? data : [])
    } catch {
      setFoods([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seller?.sellerId])

  const handleDelete = async (foodId) => {
    try {
      await deleteFood(foodId)
      toast.success('Dish removed')
      setConfirmDelete(null)
      load()
    } catch (err) {
      toast.error(extractError(err))
    }
  }

  const handleToggle = async (foodId) => {
    try {
      await toggleAvailability(foodId)
      toast.success('Availability updated')
      load()
    } catch (err) {
      toast.error(extractError(err))
    }
  }

  if (loading) return <Loader />

  return (
    <div className="page container" style={{ padding: '40px 24px 80px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 32,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1 style={{ fontSize: 32, marginBottom: 6 }}>Menu</h1>
          <p style={{ color: 'var(--text-3)', fontSize: 15 }}>
            {foods.length} dish{foods.length !== 1 ? 'es' : ''} on your menu
          </p>
        </div>
        <Button onClick={() => navigate('/seller/foods/add')}>
          <PlusIcon size={16} /> Add new dish
        </Button>
      </div>

      {foods.length === 0 ? (
        <EmptyState
          icon={<UtensilsIcon size={40} />}
          title="No dishes yet"
          text="Add your first dish to start selling."
          action={
            <Button onClick={() => navigate('/seller/foods/add')}>
              <PlusIcon size={16} /> Add your first dish
            </Button>
          }
        />
      ) : (
        <div
          className="stagger"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 20,
          }}
        >
          {foods.map((food) => (
            <div
              key={food.foodId}
              className="card"
              style={{ padding: 0, overflow: 'hidden' }}
            >
              <div
                style={{
                  position: 'relative',
                  aspectRatio: '16/9',
                  background: 'var(--bg-2)',
                }}
              >
                <img
                  src={food.imageUrl || pickImage(food.foodId)}
                  alt={food.foodName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.currentTarget.src = pickImage(food.foodId)
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    padding: '4px 10px',
                    borderRadius: 9999,
                    background: food.isAvailable
                      ? 'rgba(16,185,129,0.95)'
                      : 'rgba(239,68,68,0.95)',
                    color: 'white',
                    fontSize: 11,
                    fontWeight: 700,
                    backdropFilter: 'blur(6px)',
                  }}
                >
                  {food.isAvailable ? 'AVAILABLE' : 'HIDDEN'}
                </div>
              </div>

              <div style={{ padding: 18 }}>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 15,
                    marginBottom: 6,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {food.foodName}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    fontSize: 12,
                    color: 'var(--text-4)',
                    marginBottom: 12,
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <ClockIcon size={12} /> {food.preparationTimeMinutes} min
                  </span>
                  {food.foodType === 'VEG' ? (
                    <span style={{ color: '#16A34A', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      <LeafIcon size={12} /> Veg
                    </span>
                  ) : (
                    <span style={{ color: '#DC2626', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      <FlameIcon size={12} /> Non-veg
                    </span>
                  )}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: 12,
                    borderTop: '1px solid var(--border-2)',
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'Plus Jakarta Sans',
                      fontWeight: 800,
                      fontSize: 18,
                    }}
                  >
                    {formatCurrencyShort(food.price)}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-4)' }}>
                    {food.stockQuantity} in stock
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggle(food.foodId)}
                    style={{ flex: 1 }}
                  >
                    {food.isAvailable ? <XIcon size={14} /> : <CheckIcon size={14} />}
                    {food.isAvailable ? 'Hide' : 'Show'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/seller/foods/${food.foodId}/edit`)}
                  >
                    <EditIcon size={14} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setConfirmDelete(food.foodId)}
                    style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                  >
                    <TrashIcon size={14} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!confirmDelete}
        title="Delete this dish?"
        message="This removes the dish from your menu. This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  )
}