import React, { useState } from 'react'
import { Button } from './Shared'

export default function Login({ onSignIn, onNavigate, toast }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('Student')
  const [error, setError] = useState('')

  const submit = (event) => {
    event.preventDefault()
    if (!email.trim() || !password) {
      setError('Enter your email and password to continue.')
      return
    }
    setError('')
    onSignIn(role)
  }

  return (
    <main className="auth-page">
      <section className="auth-visual">
        <a className="brand brand--light" href="/" onClick={(event) => event.preventDefault()}>
          <span className="brand__mark">u</span>
          <span>
            uniorder<span className="brand__dot">.</span>
          </span>
        </a>
        <div className="auth-visual__content">
          <div className="auth-kicker">
            <span /> THE SCHOOL SHOP, SIMPLIFIED
          </div>
          <h1>
            Everything for<br />your school day.
          </h1>
          <p>Uniforms, orders, and campus essentials — all in one place, made simple for everyone.</p>
          <div className="auth-visual__art">
            <div className="auth-orbit auth-orbit--one" />
            <div className="auth-orbit auth-orbit--two" />
            <div className="auth-shirt">
              <span />
            </div>
            <div className="floating-card floating-card--one">
              <span className="floating-card__check">✓</span>
              <span>
                <strong>Order confirmed</strong>
                <small>Ready for pickup soon</small>
              </span>
            </div>
            <div className="floating-card floating-card--two">
              <span className="floating-card__dot" />
              <span>
                <strong>New term, fresh fit</strong>
                <small>Explore this season's collection</small>
              </span>
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
          <div className="auth-panel__eyebrow">WELCOME BACK</div>
          <h2>Sign in to Uniorder</h2>
          <p className="auth-panel__lead">Enter your details or choose a demo role below.</p>

          <form className="auth-form" onSubmit={submit}>
            <label>
              <span>Workspace role</span>
              <select value={role} onChange={(event) => setRole(event.target.value)}>
                <option>Student</option>
                <option>Staff</option>
                <option>Finance</option>
                <option>Administrator</option>
              </select>
            </label>
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
            <label>
              <span>Password</span>
              <input
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>

            <div className="auth-form__helpers">
              <button
                type="button"
                className="text-button"
                onClick={() => onNavigate('/reset-password')}
              >
                Forgot password?
              </button>
            </div>

            {error && <div className="form-error" role="alert">{error}</div>}

            <Button type="submit" className="auth-submit">
              Sign in <span>→</span>
            </Button>
          </form>

          <div className="auth-divider">
            <span>or explore with demo profiles</span>
          </div>

          <div className="quick-roles">
            {['Student', 'Staff', 'Finance', 'Administrator'].map((r) => (
              <button
                key={r}
                type="button"
                className="quick-role-btn"
                onClick={() => onSignIn(r)}
              >
                Quick log in as <strong>{r}</strong>
              </button>
            ))}
          </div>

          <p className="auth-switch">
            New to Uniorder?{' '}
            <button
              type="button"
              className="text-button"
              onClick={() => onNavigate('/signup')}
            >
              Create an account
            </button>
          </p>
        </div>
      </section>
      {toast && <div className="toast">{toast}</div>}
    </main>
  )
}

