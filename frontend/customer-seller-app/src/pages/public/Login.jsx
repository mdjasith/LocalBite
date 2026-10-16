import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { extractError } from '../../api/axiosClient'
import { ZapIcon, ShieldIcon, TruckIcon, ArrowRightIcon } from '../../components/icons'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const { refresh } = useCart()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setErrors({
        email: !form.email ? 'Email required' : '',
        password: !form.password ? 'Password required' : '',
      })
      return
    }

    setLoading(true)
    try {
      const u = await login(form.email, form.password)
      toast.success(`Welcome back, ${u.email}`)
      try {
        await refresh()
      } catch {
        /* ignore */
      }
      const from = location.state?.from?.pathname
      if (from) navigate(from, { replace: true })
      else if (u.role === 'SELLER') navigate('/seller/dashboard')
      else navigate('/home')
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
          <h1 className="auth-visual__title">Welcome back to LocalBite.</h1>
          <p className="auth-visual__text">
            Order from local sellers. Track delivery. All simulated.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 40 }}>
            {[
              { icon: <ZapIcon size={18} />, text: 'Fast, modern checkout' },
              { icon: <ShieldIcon size={18} />, text: 'JWT secured' },
              { icon: <TruckIcon size={18} />, text: 'OTP-verified delivery' },
            ].map((f, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  color: 'rgba(255,255,255,0.9)',
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {f.icon}
                </div>
                <span style={{ fontWeight: 500 }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-form-container">
          <h1 className="auth-form__title">Sign in</h1>
          <p className="auth-form__subtitle">Welcome back. Enter your credentials.</p>

          <form onSubmit={handleSubmit} className="auth-form__fields">
            <Input
              label="Email address"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              autoComplete="current-password"
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -6 }}>
              <Link
                to="/forgot-password"
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--brand-primary)',
                }}
              >
                Forgot password?
              </Link>
            </div>

            <Button type="submit" size="lg" block loading={loading}>
              Sign in <ArrowRightIcon size={18} />
            </Button>
          </form>

          <div className="auth-form__footer">
            Don't have an account?{' '}
            <Link to="/register" style={{ fontWeight: 600 }}>
              Create one
            </Link>
          </div>
          <div className="auth-form__footer" style={{ marginTop: 8 }}>
            Want to sell?{' '}
            <Link to="/seller/register" style={{ fontWeight: 600 }}>
              Become a seller
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}