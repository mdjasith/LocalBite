import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import {
  ArrowLeftIcon, MailIcon, LockIcon, CheckCircleIcon, ShieldIcon,
} from '../../components/icons'
import { sendPasswordResetCode, generateSixDigitCode } from '../../utils/emailService'

const STEP = { EMAIL: 1, CODE: 2, NEW_PASSWORD: 3, DONE: 4 }

export default function ForgotPassword() {
  const navigate = useNavigate()

  const [step, setStep] = useState(STEP.EMAIL)
  const [email, setEmail] = useState('')
  const [generatedCode, setGeneratedCode] = useState('')
  const [enteredCode, setEnteredCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handleSendCode = async (e) => {
    if (e) e.preventDefault()
    const next = {}
    if (!email.trim()) next.email = 'Email required'
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = 'Enter a valid email'
    if (Object.keys(next).length) { setErrors(next); return }

    setLoading(true)
    try {
      const code = generateSixDigitCode()
      const res = await sendPasswordResetCode({ toEmail: email, code })
      if (res.success) {
        setGeneratedCode(code)
        toast.success('Verification code sent to ' + email)
        setStep(STEP.CODE)
      } else {
        toast.error('Could not send code: ' + (res.error || 'Unknown error'))
      }
    } catch {
      toast.error('Could not send code')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = (e) => {
    e.preventDefault()
    if (enteredCode.trim() !== generatedCode) {
      setErrors({ code: 'Invalid code. Check your email and try again.' })
      return
    }
    setErrors({})
    toast.success('Code verified')
    setStep(STEP.NEW_PASSWORD)
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    const next = {}
    if (newPassword.length < 6) next.newPassword = 'At least 6 characters'
    if (newPassword !== confirmPassword) next.confirmPassword = 'Passwords do not match'
    if (Object.keys(next).length) { setErrors(next); return }

    setLoading(true)
    try {
      await new Promise((r) => setTimeout(r, 900))
      setStep(STEP.DONE)
      toast.success('Password reset successfully')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page auth-page">
      <div className="auth-visual">
        <div className="auth-visual__content">
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 24,
            border: '1px solid rgba(255,255,255,0.15)',
          }}>
            <ShieldIcon size={36} />
          </div>
          <h1 className="auth-visual__title">Reset your password.</h1>
          <p className="auth-visual__text">
            We'll send a 6-digit code to your email. Enter it to set a new password.
          </p>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-form-container">
          {step === STEP.EMAIL && (
            <>
              <h1 className="auth-form__title">Forgot password?</h1>
              <p className="auth-form__subtitle">
                Enter the email you signed up with. We'll send a verification code.
              </p>

              <form onSubmit={handleSendCode} className="auth-form__fields">
                <Input
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors({}) }}
                  error={errors.email}
                  autoFocus
                />
                <Button type="submit" size="lg" block loading={loading}>
                  <MailIcon size={16} /> Send verification code
                </Button>
              </form>

              <div className="auth-form__footer">
                Remembered it? <Link to="/login" style={{ fontWeight: 600 }}>Back to login</Link>
              </div>
            </>
          )}

          {step === STEP.CODE && (
            <>
              <h1 className="auth-form__title">Enter the code</h1>
              <p className="auth-form__subtitle">
                We sent a 6-digit code to <strong>{email}</strong>
              </p>

              <form onSubmit={handleVerifyCode} className="auth-form__fields">
                <div className="field">
                  <label className="field__label">Verification code</label>
                  <input
                    className="field__input"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    value={enteredCode}
                    onChange={(e) => { setEnteredCode(e.target.value.replace(/\D/g, '')); setErrors({}) }}
                    autoFocus
                    style={{
                      fontFamily: 'Plus Jakarta Sans',
                      fontWeight: 800,
                      fontSize: 24,
                      letterSpacing: '0.4em',
                      textAlign: 'center',
                    }}
                  />
                  {errors.code && <span className="field__error">{errors.code}</span>}
                </div>

                <Button type="submit" size="lg" block disabled={enteredCode.length !== 6}>
                  Verify code
                </Button>
              </form>

              <div className="auth-form__footer" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  onClick={() => { setStep(STEP.EMAIL); setEnteredCode(''); setErrors({}) }}
                  style={{ color: 'var(--text-3)', fontSize: 13, cursor: 'pointer' }}
                >
                  <ArrowLeftIcon size={12} style={{ marginRight: 4 }} /> Use a different email
                </button>
                <button
                  onClick={handleSendCode}
                  style={{ color: 'var(--brand-primary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  Resend code
                </button>
              </div>
            </>
          )}

          {step === STEP.NEW_PASSWORD && (
            <>
              <h1 className="auth-form__title">Set new password</h1>
              <p className="auth-form__subtitle">
                Choose a strong password you'll remember.
              </p>

              <form onSubmit={handleResetPassword} className="auth-form__fields">
                <Input
                  label="New password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setErrors({}) }}
                  error={errors.newPassword}
                  autoFocus
                />
                <Input
                  label="Confirm new password"
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setErrors({}) }}
                  error={errors.confirmPassword}
                />
                <Button type="submit" size="lg" block loading={loading}>
                  <LockIcon size={16} /> Reset password
                </Button>
              </form>
            </>
          )}

          {step === STEP.DONE && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{
                width: 88, height: 88, borderRadius: '50%',
                background: 'var(--gradient-success)', color: 'white',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
                boxShadow: '0 20px 60px -10px rgba(16,185,129,0.5)',
                animation: 'successPop 600ms cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}>
                <CheckCircleIcon size={44} />
              </div>
              <h1 className="auth-form__title" style={{ fontSize: 28 }}>Password reset!</h1>
              <p className="auth-form__subtitle" style={{ marginBottom: 28 }}>
                Your password has been updated. You can now sign in with your new password.
              </p>
              <Button size="lg" block onClick={() => navigate('/login', { replace: true })}>
                Go to login
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}