import React, { useEffect, useState } from 'react'
import { courses } from '../data/courses'
import { formatPhp } from '../utils/currency'

function orderStatusClass(status) {
  if (status === 'Completed' || status === 'Ready for pickup') return 'account-order-status--success'
  if (status === 'Awaiting payment') return 'account-order-status--pending'
  return 'account-order-status--processing'
}

export default function ProfileSettings({
  profile,
  orders,
  darkMode,
  onToggleDarkMode,
  onSave,
  onChangePassword,
  onSignOut,
  onClose,
}) {
  const [form, setForm] = useState(profile)
  const [activeTab, setActiveTab] = useState('profile')

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

        <div className="account-tabs" role="tablist" aria-label="Account sections">
          <button
            type="button"
            role="tab"
            id="account-profile-tab"
            aria-selected={activeTab === 'profile'}
            aria-controls="account-profile-panel"
            className={`account-tab${activeTab === 'profile' ? ' account-tab--active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button
            type="button"
            role="tab"
            id="account-orders-tab"
            aria-selected={activeTab === 'orders'}
            aria-controls="account-orders-panel"
            className={`account-tab${activeTab === 'orders' ? ' account-tab--active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Order History
          </button>
        </div>

        {activeTab === 'profile' ? (
          <div id="account-profile-panel" role="tabpanel" aria-labelledby="account-profile-tab">
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
          </div>
        ) : (
          <div id="account-orders-panel" role="tabpanel" aria-labelledby="account-orders-tab">
            <div className="account-orders-heading">
              <strong>Order History</strong>
              <span>{orders.length} {orders.length === 1 ? 'order' : 'orders'}</span>
            </div>
            {orders.length ? (
              <div className="account-orders-list">
                {orders.map((order) => (
                  <article className="account-order" key={order.id}>
                    <div className="account-order__main">
                      <strong>{order.id}</strong>
                      <span>{order.date} · {order.items}</span>
                    </div>
                    <div className="account-order__meta">
                      <strong>{formatPhp(order.total)}</strong>
                      <span className={`account-order-status ${orderStatusClass(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="account-orders-empty">No orders yet. Your orders will appear here.</p>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
