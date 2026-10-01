import { useState } from 'react'
import { Button } from './Shared'

function FieldIcon({ name }) {
  if (name === 'user') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="8" r="4" />
        <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 1 1 8 0v3" />
    </svg>
  )
}

function TextField({ label, name, type = 'text', value, onChange, placeholder, autoComplete }) {
  return (
    <label className="login-field">
      <span>{label}</span>
      <span className="login-field__control">
        <input
          name={name}
          type={type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required
        />
        <FieldIcon name={name === 'password' ? 'lock' : 'user'} />
      </span>
    </label>
  )
}

export default function Login({ onSignIn, onNavigate, toast, initialMode = 'login' }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('Student')
  const [loginError, setLoginError] = useState('')
  const [signupError, setSignupError] = useState('')
  const isSignup = initialMode === 'signup'

  const switchMode = (nextMode) => {
    setLoginError('')
    setSignupError('')
    onNavigate(nextMode === 'signup' ? '/signup' : '/login')
  }

  const submitLogin = (event) => {
    event.preventDefault()
    if (!email.trim() || !password) {
      setLoginError('Enter your email and password to continue.')
      return
    }
    setLoginError('')
    onSignIn(role)
  }

  const submitSignup = (event) => {
    event.preventDefault()
    if (!name.trim() || !email.trim() || password.length < 6) {
      setSignupError('Add your name and email. Passwords must be at least 6 characters.')
      return
    }
    setSignupError('')
    onSignIn(role)
  }

  const stopLinkNavigation = (event) => event.preventDefault()

  return (
    <main className="login-page">
      <section
        className={`login-card${isSignup ? ' login-card--signup' : ''}`}
        aria-label={isSignup ? 'Create a Uniorder account' : 'Uniorder sign in'}
      >
        <div
          className={`login-card__view login-card__view--signup${isSignup ? ' is-active' : ''}`}
          aria-hidden={!isSignup}
          inert={!isSignup}
        >
          <a className="login-brand" href="/" onClick={stopLinkNavigation} aria-label="Uniorder home">
            <span className="login-brand__mark">u</span>
            <span>uniorder<span className="login-brand__dot">.</span></span>
          </a>
          <div className="login-card__heading">
            <span className="login-eyebrow">GET STARTED</span>
            <h1>Register</h1>
            <p>Create an account for your campus shop.</p>
          </div>

          <form className="login-form" onSubmit={submitSignup}>
            <TextField
              label="Username"
              name="name"
              autoComplete="name"
              placeholder="Your full name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@bluenile.edu"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <label className="login-field">
              <span>Workspace role</span>
              <select value={role} onChange={(event) => setRole(event.target.value)}>
                <option>Student</option>
                <option>Finance</option>
                <option value="Administrator">Mother Admin</option>
              </select>
            </label>

            {signupError && <div className="login-error" role="alert">{signupError}</div>}
            <Button type="submit" className="login-submit">
              Register <span aria-hidden="true">→</span>
            </Button>
          </form>

          <p className="login-signup">
            Already have an account?{' '}
            <button type="button" className="login-link" onClick={() => switchMode('login')}>
              Sign in
            </button>
          </p>
        </div>

        <div
          className={`login-card__view login-card__view--login${!isSignup ? ' is-active' : ''}`}
          aria-hidden={isSignup}
          inert={isSignup}
        >
          <a className="login-brand" href="/" onClick={stopLinkNavigation} aria-label="Uniorder home">
            <span className="login-brand__mark">u</span>
            <span>uniorder<span className="login-brand__dot">.</span></span>
          </a>
          <div className="login-card__heading">
            <span className="login-eyebrow">YOUR CAMPUS SHOP</span>
            <h1>Login</h1>
            <p>Sign in to continue to your Uniorder account.</p>
          </div>

          <form className="login-form" onSubmit={submitLogin}>
            <TextField
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@bluenile.edu"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <label className="login-field">
              <span>Workspace role</span>
              <select value={role} onChange={(event) => setRole(event.target.value)}>
                <option>Student</option>
                <option>Finance</option>
                <option value="Administrator">Mother Admin</option>
              </select>
            </label>

            <div className="login-form__helpers">
              <button type="button" className="login-link" onClick={() => onNavigate('/reset-password')}>
                Forgot password?
              </button>
            </div>

            {loginError && <div className="login-error" role="alert">{loginError}</div>}
            <Button type="submit" className="login-submit">
              Login <span aria-hidden="true">→</span>
            </Button>
          </form>

          <div className="login-demo">
            <span className="login-demo__label">OR TRY A DEMO PROFILE</span>
            <div className="login-demo__roles">
              {['Student', 'Finance', 'Administrator'].map((demoRole) => (
                <button
                  key={demoRole}
                  type="button"
                  className="login-demo__role"
                  onClick={() => onSignIn(demoRole)}
                >
                  {demoRole === 'Administrator' ? 'Mother Admin' : demoRole}
                </button>
              ))}
            </div>
          </div>

          <p className="login-signup">
            Don&apos;t have an account?{' '}
            <button type="button" className="login-link" onClick={() => switchMode('signup')}>
              Sign up
            </button>
          </p>
        </div>

        <aside className="login-card__welcome" aria-hidden="true">
          <div className="login-card__welcome-glow" />
          <div className="login-card__welcome-copy login-card__welcome-copy--login">
            <span className="login-card__welcome-kicker">A BETTER SCHOOL SHOP</span>
            <h2>WELCOME<br />BACK!</h2>
            <p>Your school essentials, all in one place.</p>
            <span className="login-card__welcome-footer">UNIFORM · ORDERS · CAMPUS LIFE</span>
          </div>
          <div className="login-card__welcome-copy login-card__welcome-copy--signup">
            <span className="login-card__welcome-kicker">YOUR CAMPUS SHOP</span>
            <h2>WELCOME!</h2>
            <p>Join your school community today.</p>
            <span className="login-card__welcome-footer">UNIFORM · ORDERS · CAMPUS LIFE</span>
          </div>
        </aside>
      </section>

      <p className="login-page__footer">© 2026 Uniorder. Made for your school day.</p>
      {toast && <div className="toast">{toast}</div>}
    </main>
  )
}
