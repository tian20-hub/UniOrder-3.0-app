  import React, { useEffect, useState } from 'react'
import { Badge, Button, Icon, PageIntro, StatCard } from './Shared'
import Inventory from './Inventory'
import { defaultAdminSettings } from '../data/adminSettings'
import { formatEtbAsPhp } from '../utils/currency'

const sections = [
  { id: 'accounts', label: 'Accounts' },
  { id: 'stocks', label: 'Stocks update' },
  { id: 'orders', label: 'Order & Deadline Constraints' },
  { id: 'notifications', label: 'Notifications & Terms' },
]

const emptyAccount = { name: '', email: '', role: 'Student', group: '' }
const roles = ['Student', 'Finance', 'Administrator']
const displayRole = (role) => (role === 'Administrator' ? 'Mother Admin' : role)

function csvCell(value) {
  const text = String(value)
  const safeText = /^[\s]*[=+\-@\t\r]/.test(text) ? `'${text}` : text
  return `"${safeText.replaceAll('"', '""')}"`
}

export default function MotherAdmin({
  onNotify,
  accounts: users,
  onInviteUser,
  onSetAccountRole,
  onSetAccountAccess,
  inventory,
  onSaveProduct,
  onAdjustStock,
  adminSettings,
  onSaveSettings,
}) {
  const [filter, setFilter] = useState('All accounts')
  const [section, setSection] = useState('accounts')
  const [accountFormOpen, setAccountFormOpen] = useState(false)
  const [account, setAccount] = useState(emptyAccount)
  const [accountError, setAccountError] = useState('')
  const [settingsDraft, setSettingsDraft] = useState(adminSettings || defaultAdminSettings)

  useEffect(() => {
    setSettingsDraft(adminSettings || defaultAdminSettings)
  }, [adminSettings])

  const visibleUsers = filter === 'All accounts' ? users : users.filter((user) => user.role === filter)
  const activeUsers = users.filter((user) => user.status === 'Active').length
  const inventoryUnits = inventory.reduce(
    (total, item) => total + item.sizes.reduce((sum, size) => sum + size.stock, 0),
    0
  )
  const lowStockItems = inventory.filter((item) => (
    item.sizes.some((size) => size.stock <= size.minimum)
  )).length

  const toggleStatus = (user) => {
    onSetAccountAccess(user, user.status !== 'Active')
  }

  const addAccount = async (event) => {
    event.preventDefault()
    const normalizedEmail = account.email.trim().toLowerCase()
    if (users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
      setAccountError('An account with this email already exists.')
      return
    }
    const invited = await onInviteUser({
      ...account,
      name: account.name.trim(),
      email: normalizedEmail,
      group: account.group.trim(),
    })
    if (invited) {
      setAccount(emptyAccount)
      setAccountError('')
      setAccountFormOpen(false)
    }
  }

  const exportUsers = () => {
    try {
      const rows = [
        ['Name', 'Email', 'Role', 'Group', 'Status'],
        ...visibleUsers.map((user) => [user.name, user.email, user.role, user.group_name, user.status]),
      ]
      const csv = rows.map((row) => row.map(csvCell).join(',')).join('\r\n')
      const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }))
      const link = document.createElement('a')
      link.href = url
      link.download = 'uniorder-workspace-members.csv'
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 0)
      onNotify(`${visibleUsers.length} workspace members exported.`)
    } catch (error) {
      console.error('Unable to export workspace members.', error)
      onNotify('Could not export the member list. Please try again.')
    }
  }

  const saveSettings = async (event) => {
    event.preventDefault()
    await onSaveSettings(settingsDraft)
  }

  const updateSettings = (updates) => {
    setSettingsDraft((current) => ({ ...current, ...updates }))
  }

  return (
    <div className="page-stack">
      <div className="admin-welcome">
        <div className="admin-welcome__icon">
          <Icon name="shield" size={24} />
        </div>
        <div>
          <span>MOTHER ADMIN CONSOLE</span>
          <strong>Good afternoon, Admin.</strong>
          <p>Manage accounts, stock, checkout rules, and campus policies.</p>
        </div>
        <div className="admin-welcome__status">
          <span /> All systems operational
        </div>
      </div>

      <div className="stats-grid admin-stats">
        <StatCard label="Accounts" value={users.length} change="Workspace members" icon="grid" tone="blue" />
        <StatCard label="Active accounts" value={activeUsers} change="Access enabled" icon="chart" tone="green" />
        <StatCard label="Stock units" value={inventoryUnits} change={`${inventory.length} listed products`} icon="package" tone="purple" />
        <StatCard label="Low-stock alerts" value={lowStockItems} change="Restock recommended" icon="bell" tone="amber" />
      </div>

      <nav className="mother-admin-tabs" aria-label="Mother Admin settings">
        {sections.map((item) => (
          <button
            key={item.id}
            type="button"
            className={section === item.id ? 'mother-admin-tab mother-admin-tab--active' : 'mother-admin-tab'}
            aria-current={section === item.id ? 'page' : undefined}
            onClick={() => setSection(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {section === 'accounts' && (
        <section className="surface admin-users">
          <PageIntro
            eyebrow="PEOPLE & ACCESS"
            title="Accounts"
            subtitle="Invite users, assign trusted roles, and manage account access."
            action={
              <Button onClick={() => {
                setAccountError('')
                setAccountFormOpen((current) => !current)
              }}>
                <Icon name="plus" size={17} /> {accountFormOpen ? 'Cancel' : 'Add account'}
              </Button>
            }
          />
          {accountFormOpen && (
            <form className="mother-admin-form" onSubmit={addAccount}>
              <label>
                Full name
                <input
                  required
                  maxLength={80}
                  value={account.name}
                  onChange={(event) => setAccount({ ...account, name: event.target.value })}
                />
              </label>
              <label>
                Email
                <input
                  required
                  type="email"
                  maxLength={120}
                  value={account.email}
                  onChange={(event) => setAccount({ ...account, email: event.target.value })}
                />
              </label>
              <label>
                Role
                <select
                  value={account.role}
                  onChange={(event) => setAccount({ ...account, role: event.target.value })}
                >
                  {roles.map((role) => <option key={role} value={role}>{displayRole(role)}</option>)}
                </select>
              </label>
              <label>
                Group (optional)
                <input
                  maxLength={80}
                  value={account.group}
                  onChange={(event) => setAccount({ ...account, group: event.target.value })}
                />
              </label>
              {accountError && <p className="mother-admin-error" role="alert">{accountError}</p>}
              <Button type="submit"><Icon name="plus" size={16} /> Send invitation</Button>
            </form>
          )}
          <div className="table-toolbar">
            <div className="table-tabs" role="group" aria-label="Filter workspace accounts">
              {['All accounts', ...roles].map((item) => (
                <button
                  key={item}
                  type="button"
                  className={filter === item ? 'table-tab table-tab--active' : 'table-tab'}
                  aria-pressed={filter === item}
                  onClick={() => setFilter(item)}
                >
                  {item === 'All accounts' ? item : displayRole(item)}
                </button>
              ))}
            </div>
            <button type="button" className="outline-control" onClick={exportUsers}>
              <Icon name="grid" size={15} /> Export list
            </button>
          </div>
          <div className="table-wrap">
            <table className="data-table admin-table">
              <thead>
                <tr>
                  <th>ACCOUNT</th><th>ROLE</th><th>GROUP</th><th>STATUS</th><th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {visibleUsers.map((user, index) => (
                  <tr key={user.id}>
                    <td>
                      <div className="member-cell">
                        <span className={`member-avatar member-avatar--${index % 4}`}>{user.initials}</span>
                        <span><strong>{user.name}</strong><small>{user.email}</small></span>
                      </div>
                    </td>
                    <td><Badge tone={user.role === 'Finance' ? 'purple' : user.role === 'Administrator' ? 'blue' : 'neutral'}>{displayRole(user.role)}</Badge></td>
                    <td>{user.group_name}</td>
                    <td><Badge tone={user.status === 'Active' ? 'green' : user.status === 'Invited' ? 'amber' : 'neutral'}><span className="badge-dot" />{user.status}</Badge></td>
                    <td>
                      <div className="member-actions">
                        <select
                          aria-label={`Change role for ${user.name}`}
                          value={user.role}
                          onChange={(event) => onSetAccountRole(user, event.target.value)}
                        >
                          {roles.map((role) => <option key={role} value={role}>{displayRole(role)}</option>)}
                        </select>
                        {user.status === 'Invited'
                          ? <span className="muted-action">Invite pending</span>
                          : (
                            <button type="button" className="member-action" onClick={() => toggleStatus(user)}>
                              {user.status === 'Active' ? 'Pause' : 'Activate'}
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!visibleUsers.length && <tr><td colSpan="5" className="table-empty">No accounts in this group.</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="admin-note"><span>i</span><p><strong>Account access</strong> Invitations are sent by Supabase Auth. Roles cannot be selected during public sign-up.</p></div>
        </section>
      )}

      {section === 'stocks' && (
        <Inventory
          inventory={inventory}
          onSaveProduct={onSaveProduct}
          onAdjustStock={onAdjustStock}
          onNotify={onNotify}
        />
      )}

      {section === 'orders' && (
        <section className="surface mother-admin-settings">
          <PageIntro eyebrow="ORDER POLICY" title="Order & Deadline Constraints" subtitle="Control whether orders are accepted and set ordering limits." />
          <form className="mother-admin-settings__form" onSubmit={saveSettings}>
            <label className="mother-admin-switch">
              <input
                type="checkbox"
                checked={settingsDraft.orderingEnabled}
                onChange={(event) => updateSettings({ orderingEnabled: event.target.checked })}
              />
              <span><strong>Accept new orders</strong><small>Turn off to pause checkout across the student catalog.</small></span>
            </label>
            <label>
              Order deadline
              <input
                type="datetime-local"
                value={settingsDraft.orderDeadline}
                onChange={(event) => updateSettings({ orderDeadline: event.target.value })}
              />
              <small>Leave blank to keep ordering open until you pause it.</small>
            </label>
            <label>
              Maximum items per order
              <input
                type="number"
                min="1"
                max="500"
                step="1"
                value={settingsDraft.maxItemsPerOrder || ''}
                placeholder="No limit"
                onChange={(event) => updateSettings({ maxItemsPerOrder: event.target.value === '' ? 0 : Number(event.target.value) })}
              />
              <small>Leave blank for no campus-specific limit (orders are still capped at 500 items).</small>
            </label>
            <Button type="submit"><Icon name="check" size={16} /> Save order constraints</Button>
          </form>
        </section>
      )}

      {section === 'notifications' && (
        <section className="surface mother-admin-settings">
          <PageIntro eyebrow="CAMPUS MESSAGING" title="Notifications & Terms" subtitle="Publish a catalog announcement and maintain the terms students accept at checkout." />
          <form className="mother-admin-settings__form" onSubmit={saveSettings}>
            <label>
              Student announcement
              <textarea
                rows="3"
                maxLength={240}
                value={settingsDraft.announcement}
                onChange={(event) => updateSettings({ announcement: event.target.value })}
                placeholder="Optional message shown above the catalog."
              />
              <small>{settingsDraft.announcement.length}/240 characters</small>
            </label>
            <label>
              Checkout terms
              <textarea
                rows="6"
                maxLength={1500}
                value={settingsDraft.terms}
                onChange={(event) => updateSettings({ terms: event.target.value })}
              />
              <small>Students must agree to these terms to submit an order.</small>
            </label>
            <Button type="submit"><Icon name="check" size={16} /> Save notifications & terms</Button>
          </form>
        </section>
      )}
    </div>
  )
}
