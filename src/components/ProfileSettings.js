import React, { useEffect, useState } from 'react'

export default function ProfileSettings({ profile, onSave, onClose }) {
  const [form, setForm] = useState(profile)

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const submit = (event) => {
    event.preventDefault()
    if (onSave(form)) onClose()
  }

  return (
    <div className="profile-settings-overlay" onMouseDown={onClose}>
      <section
        className="profile-settings"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-settings-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="profile-settings__header">
          <div>
            <span className="profile-settings__eyebrow">YOUR ACCOUNT</span>
            <h2 id="profile-settings-title">Profile settings</h2>
            <p>Update your details and ordering notifications.</p>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close profile settings">
            ×
          </button>
        </header>

        <form onSubmit={submit}>
          <div className="profile-settings__fields">
            <label>
              <span>Full name</span>
              <input
                autoComplete="name"
                required
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
              />
            </label>
            <label>
              <span>Email address</span>
              <input
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={(event) => updateField('email', event.target.value)}
              />
            </label>
            <label>
              <span>Grade / year</span>
              <input
                required
                value={form.grade}
                onChange={(event) => updateField('grade', event.target.value)}
              />
            </label>
            <label>
              <span>Campus</span>
              <input
                required
                value={form.campus}
                onChange={(event) => updateField('campus', event.target.value)}
              />
            </label>
          </div>

          <fieldset className="profile-settings__notifications">
            <legend>Notifications</legend>
            <label>
              <input
                type="checkbox"
                checked={form.orderUpdates}
                onChange={(event) => updateField('orderUpdates', event.target.checked)}
              />
              <span>
                <strong>Order updates</strong>
                <small>Get updates when an order is ready or its status changes.</small>
              </span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={form.promotions}
                onChange={(event) => updateField('promotions', event.target.checked)}
              />
              <span>
                <strong>Offers and announcements</strong>
                <small>Receive school shop offers and important announcements.</small>
              </span>
            </label>
          </fieldset>

          <footer className="profile-settings__actions">
            <button type="button" className="button button--outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="button button--primary">Save changes</button>
          </footer>
        </form>
      </section>
    </div>
  )
}
