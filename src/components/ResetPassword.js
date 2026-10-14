import { useState } from 'react'
import { Button } from './Shared'
import { requireSupabase } from '../lib/supabase'

export default function ResetPassword({ onNavigate, authenticated = false, onComplete }) {
  const [email, setEmail] = useState('')
  const [step, setStep] = useState(() => (
    authenticated || window.location.hash.includes('type=recovery') ? 'password' : 'email'
  ))
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('error')
  const [busy, setBusy] = useState(false)

  const showMessage = (text, type = 'error') => {
    setMessage(text)
    setMessageType(type)
  }

  const sendCode = async (event) => {
    event.preventDefault()
    const normalizedEmail = email.trim()
    if (!normalizedEmail) {
      showMessage('Enter your email address to receive a reset link.')
      return
    }

    setBusy(true)
    try {
      const { error } = await requireSupabase().auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
      setEmail(normalizedEmail)
      setStep('sent')
      showMessage('If an account exists for that email, a password reset link is on its way.', 'success')
    } catch (error) {
      showMessage(error.message || 'Unable to send a reset link. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const savePassword = async (event) => {
    event.preventDefault()
    if (password.length < 6) {
      showMessage('Choose a password with at least 6 characters.')
      return
    }
    if (password !== confirmPassword) {
      showMessage('Your passwords do not match.')
      return
    }

    setBusy(true)
    try {
      const { error } = await requireSupabase().auth.updateUser({ password })
      if (error) throw error
      setStep('done')
      showMessage('Your password has been updated.', 'success')
      onComplete?.()
    } catch (error) {
      showMessage(error.message || 'Unable to update your password. Request a new reset link and try again.')
    } finally {
      setBusy(false)
    }
  }

  const title = step === 'email'
    ? 'Forgot your password?'
    : step === 'sent'
      ? 'Check your inbox'
      : step === 'password'
        ? 'Choose a new password'
        : 'Password reset complete'
  const description = step === 'email'
    ? 'Enter your school email to start resetting your password.'
    : step === 'sent'
      ? `Follow the secure link sent to ${email}.`
      : step === 'password'
        ? 'Choose a new password for your account.'
        : `Your password reset for ${email} is complete.`

  return (
    <main className="login-page">
      <section className="login-card login-card--recovery" aria-label="Reset your Uniorder password">
        <aside className="login-card__welcome" aria-hidden="true">
          <div className="login-card__welcome-glow" />
          <div className="login-card__welcome-copy login-card__welcome-copy--recovery">
            <span className="login-card__welcome-kicker">ACCOUNT RECOVERY</span>
            <h2>LET&apos;S GET<br />YOU BACK.</h2>
            <p>Reset your password and get back to your school day.</p>
            <div className="recovery-steps">
              <span className={step !== 'email' ? 'is-done' : 'is-current'}>1</span>
              <i className={step !== 'email' ? 'is-done' : ''} />
              <span className={step === 'password' || step === 'done' ? 'is-current' : ''}>2</span>
              <i className={step === 'done' ? 'is-done' : ''} />
              <span className={step === 'done' ? 'is-current' : ''}>3</span>
            </div>
            <span className="login-card__welcome-footer">EMAIL · VERIFY · RESET</span>
          </div>
        </aside>

        <section className="login-card__view login-card__view--login is-active">
          <a
            className="login-brand"
            href="/"
            onClick={(event) => event.preventDefault()}
            aria-label="Uniorder home"
          >
            <span className="login-brand__mark">u</span>
            <span>uniorder<span className="login-brand__dot">.</span></span>
          </a>

          <button type="button" className="login-link recovery-back" onClick={() => onNavigate('/login')}>
            ← Back to sign in
          </button>

          <div className="login-card__heading">
            <span className="login-eyebrow">ACCOUNT RECOVERY</span>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>

          {step === 'email' && (
            <form className="login-form" onSubmit={sendCode}>
              <label className="login-field">
                <span>Email address</span>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="you@bluenile.edu"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </label>
              <Button type="submit" className="login-submit" disabled={busy}>
                Send reset link <span aria-hidden="true">→</span>
              </Button>
            </form>
          )}

          {step === 'password' && (
            <form className="login-form" onSubmit={savePassword}>
              <label className="login-field">
                <span>New password</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength={6}
                  required
                />
              </label>
              <label className="login-field">
                <span>Confirm new password</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  placeholder="Enter your new password again"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  minLength={6}
                  required
                />
              </label>
              <Button type="submit" className="login-submit" disabled={busy}>
                Reset password <span aria-hidden="true">→</span>
              </Button>
            </form>
          )}

          {step === 'done' && (
            <Button type="button" className="login-submit" onClick={() => onNavigate('/login')}>
              Back to sign in <span aria-hidden="true">→</span>
            </Button>
          )}
          {step === 'sent' && (
            <Button type="button" className="login-submit" onClick={() => onNavigate('/login')}>
              Back to sign in <span aria-hidden="true">→</span>
            </Button>
          )}

          {message && (
            <div
              className={`recovery-message${messageType === 'success' ? ' recovery-message--success' : ''}`}
              role={messageType === 'error' ? 'alert' : 'status'}
            >
              {message}
            </div>
          )}

        </section>
      </section>

      <p className="login-page__footer">© 2026 Uniorder. Made for your school day.</p>
    </main>
  )
}
