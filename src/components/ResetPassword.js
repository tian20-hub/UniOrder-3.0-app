import { useState } from 'react'
import { Button } from './Shared'

function createResetCode() {
  const value = window.crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000
  return String(value).padStart(6, '0')
}

export default function ResetPassword({ onNavigate }) {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [resetCode, setResetCode] = useState('')
  const [step, setStep] = useState('email')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('error')

  const showMessage = (text, type = 'error') => {
    setMessage(text)
    setMessageType(type)
  }

  const sendCode = (event) => {
    event.preventDefault()
    const normalizedEmail = email.trim()
    if (!normalizedEmail) {
      showMessage('Enter your email address to receive a reset code.')
      return
    }

    setEmail(normalizedEmail)
    setCode('')
    setResetCode(createResetCode())
    setStep('code')
    showMessage('A demo reset code is ready below.', 'success')
  }

  const verifyCode = (event) => {
    event.preventDefault()
    if (!/^\d{6}$/.test(code)) {
      showMessage('Enter the 6-digit code to continue.')
      return
    }
    if (code !== resetCode) {
      showMessage('That code is not correct. Check the code below and try again.')
      return
    }

    setStep('password')
    showMessage('')
  }

  const savePassword = (event) => {
    event.preventDefault()
    if (password.length < 6) {
      showMessage('Choose a password with at least 6 characters.')
      return
    }
    if (password !== confirmPassword) {
      showMessage('Your passwords do not match.')
      return
    }

    setStep('done')
    showMessage('Your password has been reset in this demo.', 'success')
  }

  const resendCode = () => {
    setResetCode(createResetCode())
    setCode('')
    showMessage('A new demo reset code is ready below.', 'success')
  }

  const stepNumber = step === 'email' ? 1 : step === 'code' ? 2 : 3
  const title = step === 'email'
    ? 'Forgot your password?'
    : step === 'code'
      ? 'Check your inbox'
      : step === 'password'
        ? 'Choose a new password'
        : 'Password reset complete'
  const description = step === 'email'
    ? 'Enter your school email to start resetting your password.'
    : step === 'code'
      ? `Enter the 6-digit code for ${email}.`
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
              <span className={stepNumber > 1 ? 'is-done' : 'is-current'}>1</span>
              <i className={stepNumber > 1 ? 'is-done' : ''} />
              <span className={stepNumber > 2 ? 'is-done' : stepNumber === 2 ? 'is-current' : ''}>2</span>
              <i className={stepNumber > 2 ? 'is-done' : ''} />
              <span className={stepNumber === 3 ? 'is-current' : ''}>3</span>
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
              <Button type="submit" className="login-submit">
                Send reset code <span aria-hidden="true">→</span>
              </Button>
            </form>
          )}

          {step === 'code' && (
            <>
              <div className="recovery-demo-code" aria-label={`Demo reset code: ${resetCode}`}>
                <span>DEMO RESET CODE</span>
                <strong>{resetCode}</strong>
              </div>
              <form className="login-form" onSubmit={verifyCode}>
                <label className="login-field">
                  <span>One-time code</span>
                  <input
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    autoComplete="one-time-code"
                    placeholder="Enter your 6-digit code"
                    value={code}
                    onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                  />
                </label>
                <Button type="submit" className="login-submit">
                  Verify code <span aria-hidden="true">→</span>
                </Button>
                <button type="button" className="login-link recovery-resend" onClick={resendCode}>
                  Resend code
                </button>
              </form>
            </>
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
              <Button type="submit" className="login-submit">
                Reset password <span aria-hidden="true">→</span>
              </Button>
            </form>
          )}

          {step === 'done' && (
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

          <p className="recovery-note">
            Demo mode: no email is sent. Use the reset code shown here to continue.
          </p>
        </section>
      </section>

      <p className="login-page__footer">© 2026 Uniorder. Made for your school day.</p>
    </main>
  )
}
