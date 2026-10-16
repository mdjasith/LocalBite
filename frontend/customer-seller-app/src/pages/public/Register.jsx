import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import { useAuth } from '../../context/AuthContext'
import { extractError } from '../../api/axiosClient'
import { createProfile } from '../../api/userApi'
import { ArrowRightIcon } from '../../components/icons'
import { COUNTRY_CODES } from '../../utils/countryCodes'

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [form, setForm] = useState({
    fullName: '',
    countryCode: '+91',
    mobile: '',
    email: '',
    password: '',
    confirm: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value })
    if (errors[field]) setErrors({ ...errors, [field]: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const next = {}
    if (!form.fullName.trim()) next.fullName = 'Name required'
    if (!form.mobile.trim() || form.mobile.replace(/\D/g, '').length < 6)
      next.mobile = 'Valid mobile required'
    if (!form.email) next.email = 'Email required'
    if (form.password.length < 6) next.password = 'At least 6 characters'
    if (form.password !== form.confirm) next.confirm = 'Passwords do not match'
    if (Object.keys(next).length) { setErrors(next); return }

    setLoading(true)
    try {
      const auth = await register(form.email, form.password, 'CUSTOMER')

      const fullPhone = `${form.countryCode}${form.mobile.replace(/\D/g, '')}`
      try {
        await createProfile(auth.userId, {
          fullName: form.fullName.trim(),
          phoneNumber: fullPhone,
          profileImageUrl: null,
        })
      } catch {
        /* profile creation failed silently — user can complete later */
      }

      toast.success('Account created!')
      navigate('/home')
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
          <h1 className="auth-visual__title">Start ordering in seconds.</h1>
          <p className="auth-visual__text">
            Create a free account. No credit card. No real orders.
          </p>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-form-container">
          <h1 className="auth-form__title">Create account</h1>
          <p className="auth-form__subtitle">Sign up as a customer to start ordering.</p>

          <form onSubmit={handleSubmit} className="auth-form__fields">
            <Input
              label="Full name"
              value={form.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              error={errors.fullName}
              placeholder="Enter your full name"
            />

            <div className="field">
              <label className="field__label">Mobile number</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <select
                  value={form.countryCode}
                  onChange={(e) => handleChange('countryCode', e.target.value)}
                  style={{
                    height: 48, padding: '0 12px', minWidth: 100,
                    border: '1.5px solid var(--border-1)',
                    borderRadius: 'var(--r-md)',
                    background: 'white', fontSize: 14, fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>
                <input
                  className="field__input"
                  style={{ flex: 1 }}
                  type="tel"
                  placeholder="9000000001"
                  value={form.mobile}
                  onChange={(e) => handleChange('mobile', e.target.value.replace(/\D/g, '').slice(0, 12))}
                />
              </div>
              {errors.mobile && <span className="field__error">{errors.mobile}</span>}
            </div>

            <Input
              label="Email address"
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              error={errors.email}
              placeholder="you@example.com"
            />
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              error={errors.password}
              placeholder="At least 6 characters"
            />
            <Input
              label="Confirm password"
              type="password"
              value={form.confirm}
              onChange={(e) => handleChange('confirm', e.target.value)}
              error={errors.confirm}
              placeholder="Re-enter password"
            />

            <Button type="submit" size="lg" block loading={loading}>
              Create account <ArrowRightIcon size={18} />
            </Button>
          </form>

          <div className="auth-form__footer">
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: 600 }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}