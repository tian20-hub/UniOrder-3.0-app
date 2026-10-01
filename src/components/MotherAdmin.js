import React, { useState } from 'react'
import { Badge, Button, Icon, PageIntro, StatCard } from './Shared'
import { formatEtbAsPhp } from '../utils/currency'

const initialUsers = [
  { name: 'Amina Mekonnen', email: 'amina.m@bluenile.edu', role: 'Student', group: 'Grade 11 · Blue Nile', status: 'Active', initials: 'AM' },
  { name: 'Samuel Desta', email: 'samuel.d@bluenile.edu', role: 'Staff', group: 'Campus shop', status: 'Active', initials: 'SD' },
  { name: 'Marta Bekele', email: 'marta.b@bluenile.edu', role: 'Finance', group: 'Finance office', status: 'Active', initials: 'MB' },
  { name: 'Henok Tadesse', email: 'henok.t@bluenile.edu', role: 'Staff', group: 'Inventory team', status: 'Invited', initials: 'HT' },
  { name: 'Liya Girma', email: 'liya.g@bluenile.edu', role: 'Student', group: 'Grade 9 · Blue Nile', status: 'Active', initials: 'LG' },
]

function csvCell(value) {
  const text = String(value)
  const safeText = /^[\s]*[=+\-@\t\r]/.test(text) ? `'${text}` : text
  return `"${safeText.replaceAll('"', '""')}"`
}

export default function MotherAdmin({ onNotify, onNavigate, inventory }) {
  const [users, setUsers] = useState(initialUsers)
  const [filter, setFilter] = useState('All users')

  const visibleUsers = filter === 'All users' ? users : users.filter((user) => user.role === filter)
  const activeUsers = users.filter((user) => user.status === 'Active').length
  const inventoryUnits = inventory.reduce((total, item) => total + item.stock, 0)
  const lowStockItems = inventory.filter((item) => item.stock <= item.minimum).length
  const inventoryValue = inventory.reduce((total, item) => total + item.stock * item.price, 0)

  const toggleStatus = (email) => {
    setUsers((current) =>
      current.map((user) =>
        user.email === email
          ? { ...user, status: user.status === 'Active' ? 'Paused' : 'Active' }
          : user
      )
    )
    const target = users.find((user) => user.email === email)
    onNotify(`${target?.name ?? 'User'} access updated.`)
  }

  const exportUsers = () => {
    try {
      const rows = [
        ['Name', 'Email', 'Role', 'Group', 'Status'],
        ...visibleUsers.map((user) => [user.name, user.email, user.role, user.group, user.status]),
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

  return (
    <div className="page-stack">
      <div className="admin-welcome">
        <div className="admin-welcome__icon">
          <Icon name="shield" size={24} />
        </div>
        <div>
          <span>ADMINISTRATOR CONSOLE</span>
          <strong>Good afternoon, Admin.</strong>
          <p>Your campus workspace is healthy and up to date.</p>
        </div>
        <div className="admin-welcome__status">
          <span /> All systems operational
        </div>
      </div>

      <div className="stats-grid admin-stats">
        <StatCard
          label="Total accounts"
          value={users.length + 1234}
          change="Across your campus"
          icon="grid"
          tone="blue"
        />
        <StatCard
          label="Active this week"
          value={activeUsers + 842}
          change="+8.4% vs last week"
          icon="chart"
          tone="green"
        />
        <StatCard
          label="Pending invites"
          value={users.filter((user) => user.status === 'Invited').length + 6}
          change="Ready to be accepted"
          icon="clock"
          tone="amber"
        />
        <StatCard
          label="Workspace roles"
          value="4"
          change="Permissions managed"
          icon="shield"
          tone="purple"
        />
      </div>

      <section className="surface admin-stock">
        <div className="admin-stock__intro">
          <div className="admin-stock__icon">
            <Icon name="package" size={21} />
          </div>
          <div>
            <span>INVENTORY CONTROL</span>
            <h2>Campus stock</h2>
            <p>Monitor inventory and add products or units to the stockroom.</p>
          </div>
        </div>
        <div className="admin-stock__metrics">
          <div><strong>{inventory.length}</strong><span>Products</span></div>
          <div><strong>{inventoryUnits}</strong><span>Units in stock</span></div>
          <div><strong>{lowStockItems}</strong><span>Low-stock alerts</span></div>
          <div><strong>{formatEtbAsPhp(inventoryValue)}</strong><span>Stock value</span></div>
        </div>
        <Button onClick={() => onNavigate('/inventory')}>
          <Icon name="package" size={17} /> Manage stock
        </Button>
      </section>

      <section className="surface admin-users">
        <PageIntro
          eyebrow="PEOPLE & ACCESS"
          title="Workspace members"
          subtitle="Manage who can access your Uniorder workspace."
          action={
            <Button onClick={() => onNotify('An invitation link has been created for your campus.')}>
              <Icon name="plus" size={17} /> Invite member
            </Button>
          }
        />
        <div className="table-toolbar">
          <div className="table-tabs" role="group" aria-label="Filter workspace members">
            {['All users', 'Student', 'Staff', 'Finance'].map((item) => (
              <button
                key={item}
                type="button"
                className={filter === item ? 'table-tab table-tab--active' : 'table-tab'}
                aria-pressed={filter === item}
                onClick={() => setFilter(item)}
              >
                {item}
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
                <th>MEMBER</th>
                <th>ROLE</th>
                <th>GROUP</th>
                <th>STATUS</th>
                <th>LAST ACTIVE</th>
                <th>
                  <span className="sr-only">Account actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleUsers.map((user, index) => (
                <tr key={user.email}>
                  <td>
                    <div className="member-cell">
                      <span className={`member-avatar member-avatar--${index % 4}`}>
                        {user.initials}
                      </span>
                      <span>
                        <strong>{user.name}</strong>
                        <small>{user.email}</small>
                      </span>
                    </div>
                  </td>
                  <td>
                    <Badge
                      tone={
                        user.role === 'Finance'
                          ? 'purple'
                          : user.role === 'Staff'
                          ? 'blue'
                          : 'neutral'
                      }
                    >
                      {user.role}
                    </Badge>
                  </td>
                  <td>{user.group}</td>
                  <td>
                    <Badge
                      tone={
                        user.status === 'Active'
                          ? 'green'
                          : user.status === 'Invited'
                          ? 'amber'
                          : 'neutral'
                      }
                    >
                      <span className="badge-dot" />
                      {user.status}
                    </Badge>
                  </td>
                  <td>
                    {['Just now', '12 min ago', '1 hour ago', 'Pending invite', 'Yesterday'][index]}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="member-action"
                      onClick={() => toggleStatus(user.email)}
                    >
                      {user.status === 'Active' ? 'Pause' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="admin-note">
          <span>i</span>
          <p>
            <strong>Access tip</strong> Pausing an account prevents sign-in but keeps its order
            history and records intact.
          </p>
        </div>
      </section>
    </div>
  )
}
