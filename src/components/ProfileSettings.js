import React, { useEffect, useState } from 'react'
import { courses } from '../data/courses'

export default function ProfileSettings({
  profile,
  darkMode,
  onToggleDarkMode,
  onSave,
  onChangePassword,
  onSignOut,
  onClose,
}) {
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

  const initials = form.name
    .trim()
    .split(/\s+/)
    .slice(0, 1)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')

  return (
    <div className="profile-settings-overlay" onMouseDown={onClose}>
      <section
        className="profile-settings profile-settings--account"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-settings-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="profile-settings__header profile-settings__header--account">
          <h2 id="profile-settings-title">My Account</h2>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close account settings">
            ×
          </button>
        </header>

        <div className="account-identity">
          <span className="account-identity__avatar">{initials || 'S'}</span>
          <span>
            <strong>{form.name || 'Student'}</strong>
            <small>{form.schoolId}</small>
          </span>
        </div>

        <form onSubmit={submit}>
          <div className="profile-settings__fields profile-settings__fields--account">
            <label>
              <span>Full Name</span>
              <input
                autoComplete="name"
                required
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
              />
            </label>
            <label>
              <span>School ID</span>
              <input
                value={form.schoolId}
                onChange={(event) => updateField('schoolId', event.target.value)}
              />
            </label>
            <label>
              <span>Email</span>
              <input
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={(event) => updateField('email', event.target.value)}
              />
            </label>
            <label>
              <span>Course</span>
              <select
                value={form.course}
                onChange={(event) => updateField('course', event.target.value)}
              >
                {courses.map((course) => <option key={course}>{course}</option>)}
              </select>
            </label>
          </div>

          <button type="submit" className="account-action account-action--save">
            Save Changes
          </button>
          <button
            type="button"
            className="account-action account-action--password"
            onClick={() => {
              onClose()
              onChangePassword()
            }}
          >
            Change Password
          </button>
          <button
            type="button"
            className="account-action account-action--logout"
            onClick={onSignOut}
          >
            Log Out
          </button>
        </form>

        <section className="account-preferences" aria-labelledby="account-preferences-title">
          <h3 id="account-preferences-title"><span aria-hidden="true">⚙</span> Settings</h3>
          <label className="account-preference">
            <span>
              <strong>Dark Mode</strong>
              <small>Switch to darker theme</small>
            </span>
            <input
              type="checkbox"
              checked={darkMode}
              onChange={onToggleDarkMode}
              aria-label="Dark Mode"
            />
          </label>
          <label className="account-preference">
            <span>
              <strong>Email Notifications</strong>
              <small>Receive order updates</small>
            </span>
            <input
              type="checkbox"
              checked={form.orderUpdates}
              onChange={(event) => updateField('orderUpdates', event.target.checked)}
              aria-label="Email Notifications"
            />
          </label>
        </section>
      </section>
    </div>
  )
}
