import React, { useState } from 'react'
import { Button } from './Shared'

export default function SignUp({ onNavigate, onSignUp }) {
  const [role, setRole] = useState('Student')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = (event) => {
    event.preventDefault()
    if (!name.trim() || !email.trim() || password.length < 6) {
      setError('Add your name and email. Passwords must be at least 6 characters.')
      return
    }
    setError('')
    onSignUp(role)
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
            <span /> A UNIFORM WAY TO GET READY
          </div>
          <h1>
            Your school<br />shop, reimagined.
          </h1>
          <p>Join your campus community and get everything you need for the year ahead.</p>
          <div className="signup-perks">
            <div>
              01 <span>Order in just a few taps</span>
            </div>
            <div>
              02 <span>Know exactly when it's ready</span>
            </div>
            <div>
              03 <span>One account for everything</span>
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
          <div className="auth-panel__eyebrow">GET STARTED</div>
          <h2>Create your account</h2>
          <p className="auth-panel__lead">A few details and you're ready to go.</p>

          <form className="auth-form" onSubmit={submit}>
            <label>
              <span>Your full name</span>
              <input
                autoComplete="name"
                placeholder="e.g. Amina Mekonnen"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
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
              <span>School email</span>
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
                autoComplete="new-password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
            {error && <div className="form-error" role="alert">{error}</div>}
            <Button type="submit" className="auth-submit">
              Create account <span>→</span>
            </Button>
          </form>
          <p className="auth-terms">By creating an account, you agree to our campus shop terms.</p>
        </div>
      </section>
    </main>
  )
}

