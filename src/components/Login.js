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

export default function Login({
  onSignIn,
  onSignUp,
  onNavigate,
  toast,
  initialMode = 'login',
  configurationError = '',
  demoEnabled = false,
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [signupError, setSignupError] = useState('')
  const [signupMessage, setSignupMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const isSignup = initialMode === 'signup'
  const displayConfigurationError = configurationError && (!demoEnabled || isSignup)
  const configurationBlocksForm = Boolean(configurationError && (!demoEnabled || isSignup))

  const switchMode = (nextMode) => {
    setLoginError('')
    setSignupError('')
    onNavigate(nextMode === 'signup' ? '/signup' : '/login')
  }

  const submitLogin = async (event) => {
    event.preventDefault()
    if (!email.trim() || !password) {
      setLoginError('Enter your email and password to continue.')
      return
    }
    setLoginError('')
    setBusy(true)
    try {
      await onSignIn(email.trim(), password)
    } catch (error) {
      setLoginError(error.message || 'Unable to sign in. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const submitSignup = async (event) => {
    event.preventDefault()
    if (!name.trim() || !email.trim() || password.length < 6) {
      setSignupError('Add your name and email. Passwords must be at least 6 characters.')
      return
    }
    setSignupError('')
    setBusy(true)
    try {
      const result = await onSignUp(name.trim(), email.trim(), password)
      if (result?.confirmationRequired) {
        setSignupMessage('Account created. Check your email to confirm your address before signing in.')
      }
    } catch (error) {
      setSignupError(error.message || 'Unable to create your account. Please try again.')
    } finally {
      setBusy(false)
    }
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
          {displayConfigurationError && <div className="login-error" role="alert">{configurationError}</div>}

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
            {signupMessage && <div className="login-success" role="status">{signupMessage}</div>}
            {signupError && <div className="login-error" role="alert">{signupError}</div>}
            <Button type="submit" className="login-submit" disabled={busy || configurationBlocksForm}>
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
          {displayConfigurationError && <div className="login-error" role="alert">{configurationError}</div>}

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
            <div className="login-form__helpers">
              <button type="button" className="login-link" onClick={() => onNavigate('/reset-password')}>
                Forgot password?
              </button>
            </div>

            {loginError && <div className="login-error" role="alert">{loginError}</div>}
            <Button type="submit" className="login-submit" disabled={busy || Boolean(configurationError)}>
              Login <span aria-hidden="true">→</span>
            </Button>
          </form>
          {demoEnabled && (
            <div className="login-demo">
              <strong>Local demo account</strong>
              <span>Email: demo.student@uniorder.local</span>
              <span>Password: Demo123!</span>
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={async () => {
                  setLoginError('')
                  setBusy(true)
                  try {
                    await onSignIn('demo.student@uniorder.local', 'Demo123!')
                  } catch (error) {
                    setLoginError(error.message || 'Unable to start the demo.')
                  } finally {
                    setBusy(false)
                  }
                }}
              >
                Continue as Demo Student
              </Button>
              <small>Development preview only. Demo orders stay in this browser.</small>
            </div>
          )}

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
