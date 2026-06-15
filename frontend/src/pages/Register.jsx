import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { register, verifyOtp, resendOtp } from '../api/auth'
import SpreetailLogo from '../components/SpreetailLogo'
import toast from 'react-hot-toast'

export default function Register() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ username: '', email: '', password: '', otp: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)

  // Timer effect
  useEffect(() => {
    let interval
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000)
    }
    return () => clearInterval(interval)
  }, [resendTimer])
  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.email || !form.password) return toast.error('Fill in all fields')
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      await register({ username: form.username, email: form.email, password: form.password })
      toast.success('Registration successful! Redirecting to login...')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpSubmit = async (e) => {
    e.preventDefault()
    if (!form.otp || form.otp.length !== 6) return toast.error('Please enter a valid 6-digit OTP')
    setLoading(true)
    try {
      await verifyOtp({ email: form.email, otp: form.otp })
      toast.success('Account verified! Please sign in.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendTimer > 0) return
    try {
      await resendOtp({ email: form.email })
      toast.success('A new OTP has been sent to your email.')
      setResendTimer(60) // 1 minute cooldown
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-dots" />

      <div className="auth-card">
        <div className="auth-logo-wrap">
          <SpreetailLogo height={26} color="#09cca9" />
        </div>

        <h1 className="auth-heading">{step === 1 ? 'Create an account' : 'Verify Email'}</h1>
        <p className="auth-subheading">
          {step === 1 ? 'Start splitting expenses with your group' : `Enter the 6-digit OTP sent to ${form.email}`}
        </p>

        {step === 1 ? (
          <form className="auth-form" onSubmit={handleRegisterSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-username">Username</label>
              <input
                id="reg-username"
                className="form-input"
                type="text"
                placeholder="johndoe"
                autoComplete="username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email</label>
              <input
                id="reg-email"
                className="form-input"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="reg-password"
                  className="form-input"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  style={{ paddingRight: '2.75rem' }}
                />
                <button
                  type="button"
                  id="toggle-reg-password"
                  onClick={() => setShowPass((v) => !v)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-dim)',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    display: 'flex',
                  }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              id="register-submit"
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
              style={{ marginTop: '0.5rem' }}
            >
              {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2.5 }} /> : null}
              Create Account
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleOtpSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-otp">6-Digit Code</label>
              <input
                id="reg-otp"
                className="form-input"
                type="text"
                placeholder="123456"
                maxLength={6}
                value={form.otp}
                onChange={(e) => setForm({ ...form, otp: e.target.value })}
                autoFocus
                style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '1.2rem', fontWeight: 'bold' }}
              />
            </div>

            <button
              id="verify-submit"
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading || form.otp.length !== 6}
              style={{ marginTop: '0.5rem' }}
            >
              {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2.5 }} /> : null}
              Verify Account
            </button>
            <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem' }}>
              <button
                type="button"
                onClick={handleResend}
                disabled={resendTimer > 0}
                style={{ background: 'none', border: 'none', color: resendTimer > 0 ? '#555' : '#09cca9', cursor: resendTimer > 0 ? 'not-allowed' : 'pointer', fontWeight: 500 }}
              >
                {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
              </button>
            </div>
          </form>
        )}

        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" id="go-to-login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
