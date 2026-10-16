import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import { useAuth } from '../../context/AuthContext'
import { useSeller } from '../../context/SellerContext'
import { extractError } from '../../api/axiosClient'
import { registerSeller } from '../../api/sellerApi'
import { StoreIcon, ArrowRightIcon } from '../../components/icons'

export default function SellerRegister() {
  const navigate = useNavigate()
  const { register, isAuthenticated, role, email: authEmail } = useAuth()
  const { refresh: refreshSeller, notFound } = useSeller()
  const [step, setStep] = useState(
    isAuthenticated && role === 'SELLER' && notFound ? 2 : 1
  )

  const [accountForm, setAccountForm] = useState({
    email: '',
    password: '',
    confirm: '',
  })
  const [storeForm, setStoreForm] = useState({
    storeName: '',
    ownerName: '',
    phoneNumber: '',
    storeDescription: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleAccountSubmit = async (e) => {
    e.preventDefault()
    const next = {}
    if (!accountForm.email) next.email = 'Email required'
    if (accountForm.password.length < 6) next.password = 'At least 6 characters'
    if (accountForm.password !== accountForm.confirm)
      next.confirm = 'Passwords do not match'
    if (Object.keys(next).length) {
      setErrors(next)
      return
    }

    setLoading(true)
    try {
      await register(accountForm.email, accountForm.password, 'SELLER')
      toast.success('Account created. Now set up your store.')
      setStep(2)
    } catch (err) {
      toast.error(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  const handleStoreSubmit = async (e) => {
    e.preventDefault()
    const next = {}
    if (!storeForm.storeName) next.storeName = 'Store name required'
    if (!storeForm.ownerName) next.ownerName = 'Owner name required'
    if (Object.keys(next).length) {
      setErrors(next)
      return
    }

    const sellerEmail = accountForm.email || authEmail
    if (!sellerEmail) {
      toast.error('Email missing. Please restart.')
      setStep(1)
      return
    }

    setLoading(true)
    try {
      await registerSeller({
        ...storeForm,
        email: sellerEmail,
      })
      await refreshSeller()
      toast.success('Store submitted! Waiting for approval.')
      navigate('/seller/pending', { replace: true })
    } catch (err) {
      toast.error(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page auth-page">
      <div className="auth-visual">
        <div className="auth-visual__content">
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            <StoreIcon size={36} />
          </div>
          <h1 className="auth-visual__title">Start selling on LocalBite.</h1>
          <p className="auth-visual__text">
            Reach customers within 10 km. Manage orders, menu, and earnings.
          </p>

          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { n: '1', text: 'Create your seller account' },
              { n: '2', text: 'Set up your store details' },
              { n: '3', text: 'Wait for admin approval' },
              { n: '4', text: 'Start receiving orders' },
            ].map((s) => (
              <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background:
                      step > Number(s.n) ? '#10B981' : 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 13,
                    flexShrink: 0,
                  }}
                >
                  {step > Number(s.n) ? '✓' : s.n}
                </div>
                <span
                  style={{
                    opacity: step >= Number(s.n) ? 1 : 0.6,
                    fontWeight: 500,
                  }}
                >
                  {s.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-form-container">
          {step === 1 && (
            <>
              <h1 className="auth-form__title">Seller account</h1>
              <p className="auth-form__subtitle">Step 1 of 2 — Login credentials.</p>

              <form onSubmit={handleAccountSubmit} className="auth-form__fields">
                <Input
                  label="Email address"
                  type="email"
                  placeholder="store@example.com"
                  value={accountForm.email}
                  onChange={(e) =>
                    setAccountForm({ ...accountForm, email: e.target.value })
                  }
                  error={errors.email}
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={accountForm.password}
                  onChange={(e) =>
                    setAccountForm({ ...accountForm, password: e.target.value })
                  }
                  error={errors.password}
                />
                <Input
                  label="Confirm password"
                  type="password"
                  placeholder="Re-enter password"
                  value={accountForm.confirm}
                  onChange={(e) =>
                    setAccountForm({ ...accountForm, confirm: e.target.value })
                  }
                  error={errors.confirm}
                />
                <Button type="submit" size="lg" block loading={loading}>
                  Continue <ArrowRightIcon size={18} />
                </Button>
              </form>

              <div className="auth-form__footer">
                Already have an account?{' '}
                <Link to="/login" style={{ fontWeight: 600 }}>
                  Sign in
                </Link>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="auth-form__title">Store details</h1>
              <p className="auth-form__subtitle">Step 2 of 2 — About your store.</p>

              <form onSubmit={handleStoreSubmit} className="auth-form__fields">
                <Input
                  label="Store name"
                  placeholder="e.g. Sunrise Kitchen"
                  value={storeForm.storeName}
                  onChange={(e) =>
                    setStoreForm({ ...storeForm, storeName: e.target.value })
                  }
                  error={errors.storeName}
                />
                <Input
                  label="Owner name"
                  placeholder="Enter owner's full name"
                  value={storeForm.ownerName}
                  onChange={(e) =>
                    setStoreForm({ ...storeForm, ownerName: e.target.value })
                  }
                  error={errors.ownerName}
                />
                <Input
                  label="Phone number"
                  type="tel"
                  placeholder="9000000001"
                  value={storeForm.phoneNumber}
                  onChange={(e) =>
                    setStoreForm({ ...storeForm, phoneNumber: e.target.value })
                  }
                />
                <Input
                  label="Store description"
                  as="textarea"
                  placeholder="Tell customers about your store..."
                  value={storeForm.storeDescription}
                  onChange={(e) =>
                    setStoreForm({
                      ...storeForm,
                      storeDescription: e.target.value,
                    })
                  }
                  rows={3}
                />
                <Button type="submit" size="lg" block loading={loading}>
                  Submit for approval
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}