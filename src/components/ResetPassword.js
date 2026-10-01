import { useState } from 'react'
import { Button } from './Shared'

export default function ResetPassword({ onNavigate }) {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [sent, setSent] = useState(false)
  const [verified, setVerified] = useState(false)
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const sendCode = (event) => {
    event.preventDefault()
    if (!email.trim()) {
      setMessage('Enter your email address to receive a reset code.')
      return
    }
    setMessage('')
    setSent(true)
  }

  const verifyCode = (event) => {
    event.preventDefault()
    if (code.trim().length < 4) {
      setMessage('Enter the 6-digit code to continue.')
      return
    }
    setMessage('')
    setVerified(true)
  }

  const savePassword = (event) => {
    event.preventDefault()
    if (password.length < 6) {
      setMessage('Choose a password with at least 6 characters.')
      return
    }
    onNavigate('/login')
  }

  const title = verified
    ? 'Choose a new password'
    : sent
      ? 'Check your inbox'
      : 'Forgot your password?'
  const description = verified
    ? 'Choose a secure password for your account.'
    : sent
      ? `We sent a one-time code to ${email}. Enter it below to continue.`
      : 'Enter your school email and we’ll send you a one-time reset code.'

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
              <span className={!sent ? 'is-current' : 'is-done'}>1</span>
              <i className={sent ? 'is-done' : ''} />
              <span className={sent && !verified ? 'is-current' : verified ? 'is-done' : ''}>2</span>
              <i className={verified ? 'is-done' : ''} />
              <span className={verified ? 'is-current' : ''}>3</span>
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

          {!sent && (
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
              <Button type="submit" className="login-submit">
                Send reset code <span aria-hidden="true">→</span>
              </Button>
            </form>
          )}

          {sent && !verified && (
            <form className="login-form" onSubmit={verifyCode}>
              <label className="login-field">
                <span>One-time code</span>
                <input
                  inputMode="numeric"
                  maxLength={6}
                  autoComplete="one-time-code"
                  placeholder="Enter your 6-digit code"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  required
                />
              </label>
              <Button type="submit" className="login-submit">
                Verify code <span aria-hidden="true">→</span>
              </Button>
              <button
                type="button"
                className="login-link recovery-resend"
                onClick={() => setMessage('A fresh code has been sent.')}
              >
                Resend code
              </button>
            </form>
          )}

          {verified && (
            <form className="login-form" onSubmit={savePassword}>
              <label className="login-field">
                <span>New password</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </label>
              <Button type="submit" className="login-submit">
                Save new password <span aria-hidden="true">→</span>
              </Button>
            </form>
          )}

          {message && (
            <div
              className={`recovery-message${message.includes('sent') ? ' recovery-message--success' : ''}`}
              role="status"
            >
              {message}
            </div>
          )}

          <p className="recovery-note">Demo flow — enter any email and a code to continue.</p>
        </section>
      </section>

      <p className="login-page__footer">© 2026 Uniorder. Made for your school day.</p>
    </main>
  )
}
