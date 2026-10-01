import React, { useState } from 'react'
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

  return (
    <main className="auth-page auth-page--compact">
      <section className="auth-visual">
        <a className="brand brand--light" href="/" onClick={(event) => event.preventDefault()}>
          <span className="brand__mark">u</span>
          <span>
            uniorder<span className="brand__dot">.</span>
          </span>
        </a>
        <div className="auth-visual__content">
          <div className="auth-kicker">
            <span /> HERE TO HELP
          </div>
          <h1>
            Let's get you<br />back on track.
          </h1>
          <p>A quick reset and you'll be back to taking care of your school day.</p>
          <div className="reset-steps">
            <div className={sent ? 'is-done' : 'is-current'}>
              <i>1</i>
              <span>Get a reset code</span>
            </div>
            <div className={verified ? 'is-done' : sent ? 'is-current' : ''}>
              <i>2</i>
              <span>Verify your email</span>
            </div>
            <div className={verified ? 'is-current' : ''}>
              <i>3</i>
              <span>Set a new password</span>
            </div>
          </div>
        </div>
        <div className="auth-visual__footer">
          A better school shop starts here. <span>© 2026 Uniorder</span>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-panel__inner">
          <div className="auth-mobile-brand brand">
            <span className="brand__mark">u</span>
            <span>
              uniorder<span className="brand__dot">.</span>
            </span>
          </div>
          <button type="button" className="back-link" onClick={() => onNavigate('/login')}>
            ← Back to sign in
          </button>
          <div className="auth-panel__eyebrow">ACCOUNT RECOVERY</div>
          <h2>{verified ? 'Choose a new password' : sent ? 'Check your inbox' : 'Forgot your password?'}</h2>
          <p className="auth-panel__lead">
            {verified
              ? 'Choose a secure password for your account.'
              : sent
              ? `We sent a one-time code to ${email}. Enter it below to continue.`
              : 'Enter your school email and we’ll send you a one-time reset code.'}
          </p>

          {!sent && (
            <form className="auth-form" onSubmit={sendCode}>
              <label>
                <span>Email address</span>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="you@bluenile.edu"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>
              <Button type="submit" className="auth-submit">
                Send reset code <span>→</span>
              </Button>
            </form>
          )}

          {sent && !verified && (
            <form className="auth-form" onSubmit={verifyCode}>
              <label>
                <span>One-time code</span>
                <input
                  inputMode="numeric"
                  maxLength="6"
                  placeholder="Enter your 6-digit code"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                />
              </label>
              <Button type="submit" className="auth-submit">
                Verify code <span>→</span>
              </Button>
              <button
                type="button"
                className="text-button resend-link"
                onClick={() => setMessage('A fresh code has been sent.')}
              >
                Resend code
              </button>
            </form>
          )}

          {verified && (
            <form className="auth-form" onSubmit={savePassword}>
              <label>
                <span>New password</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </label>
              <Button type="submit" className="auth-submit">
                Save new password <span>→</span>
              </Button>
            </form>
          )}

          {message && (
            <div className={message.includes('sent') ? 'form-success' : 'form-error'} role="status">
              {message}
            </div>
          )}
          <p className="auth-demo-note">Demo flow — enter any email and a code to continue.</p>
        </div>
      </section>
    </main>
  )
}

