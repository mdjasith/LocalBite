import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useSeller } from '../../context/SellerContext'
import {
  createFood,
  updateFood,
  getFood,
  listCategories,
} from '../../api/foodApi'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Loader from '../../components/common/Loader'
import ImageUploader from '../../components/common/ImageUploader'
import { ArrowLeftIcon, CheckIcon } from '../../components/icons'
import { extractError } from '../../api/axiosClient'

export default function FoodForm({ mode = 'add' }) {
  const { foodId } = useParams()
  const navigate = useNavigate()
  const { seller } = useSeller()

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(mode === 'edit')
  const [saving, setSaving] = useState(false)
  const [imageUrl, setImageUrl] = useState('')

  const [form, setForm] = useState({
    categoryId: '',
    foodName: '',
    description: '',
    price: '',
    stockQuantity: '',
    preparationTimeMinutes: '',
    foodType: 'VEG',
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    ;(async () => {
      try {
        const cats = await listCategories().catch(() => [])
        setCategories(Array.isArray(cats) ? cats : [])

        if (mode === 'edit' && foodId) {
          const f = await getFood(foodId)
          setForm({
            categoryId: f.categoryId || '',
            foodName: f.foodName || '',
            description: f.description || '',
            price: f.price || '',
            stockQuantity: f.stockQuantity || '',
            preparationTimeMinutes: f.preparationTimeMinutes || '',
            foodType: f.foodType || 'VEG',
          })
          setImageUrl(f.imageUrl || '')
        }
      } catch {
        toast.error('Could not load form data')
      } finally {
        setLoading(false)
      }
    })()
  }, [mode, foodId])

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value })
    if (errors[field]) setErrors({ ...errors, [field]: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const next = {}
    if (!form.categoryId) next.categoryId = 'Category required'
    if (!form.foodName.trim()) next.foodName = 'Name required'
    if (!form.price || Number(form.price) <= 0) next.price = 'Valid price required'
    if (form.stockQuantity === '' || Number(form.stockQuantity) < 0)
      next.stockQuantity = 'Stock required'
    if (!form.preparationTimeMinutes || Number(form.preparationTimeMinutes) < 1)
      next.preparationTimeMinutes = 'Prep time required'
    if (Object.keys(next).length) {
      setErrors(next)
      return
    }

    setSaving(true)
    try {
      const payload = {
        categoryId: Number(form.categoryId),
        foodName: form.foodName.trim(),
        description: form.description?.trim() || '',
        price: Number(form.price),
        stockQuantity: Number(form.stockQuantity),
        preparationTimeMinutes: Number(form.preparationTimeMinutes),
        foodType: form.foodType,
        imageUrl: imageUrl || null,
      }

      if (mode === 'edit') {
        await updateFood(foodId, payload)
        toast.success('Dish updated')
      } else {
        await createFood(payload)
        toast.success('Dish added')
      }
      navigate('/seller/foods')
    } catch (err) {
      toast.error(extractError(err))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loader />
  if (!seller) return null

  return (
    <div className="page container" style={{ padding: '40px 24px 80px', maxWidth: 640 }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 14px',
          borderRadius: 9999,
          background: 'white',
          border: '1px solid var(--border-1)',
          fontSize: 14,
          fontWeight: 600,
          marginBottom: 24,
          cursor: 'pointer',
        }}
      >
        <ArrowLeftIcon size={16} /> Back
      </button>

      <h1 style={{ fontSize: 32, marginBottom: 8 }}>
        {mode === 'edit' ? 'Edit dish' : 'Add new dish'}
      </h1>
      <p style={{ color: 'var(--text-3)', fontSize: 15, marginBottom: 32 }}>
        {mode === 'edit'
          ? 'Update the details of this dish.'
          : 'Add a new dish to your menu.'}
      </p>

      <form className="card" style={{ padding: 28 }} onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Image uploader */}
          <div className="field">
            <label className="field__label">Dish photo</label>
            <ImageUploader
              currentImageUrl={imageUrl}
              onUploadSuccess={setImageUrl}
            />
          </div>

          {/* Category */}
          <div className="field">
            <label className="field__label">Category</label>
            <select
              className="field__input"
              value={form.categoryId}
              onChange={(e) => handleChange('categoryId', e.target.value)}
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.categoryId} value={c.categoryId}>
                  {c.categoryName}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <span className="field__error">{errors.categoryId}</span>
            )}
          </div>

          {/* Name */}
          <Input
            label="Dish name"
            value={form.foodName}
            onChange={(e) => handleChange('foodName', e.target.value)}
            error={errors.foodName}
            placeholder="Chicken Biryani"
          />

          {/* Description */}
          <Input
            label="Description"
            as="textarea"
            rows={3}
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Tell customers about this dish"
          />

          {/* Price + Stock */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input
              label="Price (₹)"
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => handleChange('price', e.target.value)}
              error={errors.price}
              placeholder="180"
            />
            <Input
              label="Stock quantity"
              type="number"
              value={form.stockQuantity}
              onChange={(e) => handleChange('stockQuantity', e.target.value)}
              error={errors.stockQuantity}
              placeholder="50"
            />
          </div>

          {/* Prep time + Type */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input
              label="Prep time (min)"
              type="number"
              value={form.preparationTimeMinutes}
              onChange={(e) =>
                handleChange('preparationTimeMinutes', e.target.value)
              }
              error={errors.preparationTimeMinutes}
              placeholder="25"
            />
            <div className="field">
              <label className="field__label">Food type</label>
              <select
                className="field__input"
                value={form.foodType}
                onChange={(e) => handleChange('foodType', e.target.value)}
              >
                <option value="VEG">Veg</option>
                <option value="NON_VEG">Non-Veg</option>
                <option value="EGG">Egg</option>
              </select>
            </div>
          </div>

          {/* Submit */}
          <Button type="submit" size="lg" block loading={saving}>
            <CheckIcon size={16} />
            {mode === 'edit' ? 'Update dish' : 'Add dish'}
          </Button>
        </div>
      </form>
    </div>
  )
}