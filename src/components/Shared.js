import React, { useEffect, useState } from 'react'
import ProfileSettings from './ProfileSettings'

const iconPaths = {
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.6a8 8 0 0 1-1.5.9l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.5-.9l-1.7.6-1.4-2.4 1.4-1.1a7 7 0 0 1 0-1.8l-1.4-1.1 1.4-2.4 1.7.6a8 8 0 0 1 1.5-.9l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.5.9l1.7-.6 1.4 2.4-1.4 1.1a7 7 0 0 1-.1 1.7Z" />
    </>
  ),
  bag: (
    <>
      <path d="M5 8h14l1 13H4L5 8Z" />
      <path d="M9 9V6a3 3 0 0 1 6 0v3" />
    </>
  ),
  package: (
    <>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 8 9 5 9-5M3 8v9l9 5 9-5V8M12 13v9" />
    </>
  ),
  receipt: (
    <>
      <path d="M5 3h14v18l-3-2-4 2-4-2-3 2V3Z" />
      <path d="M9 8h6M9 12h6M9 16h3" />
    </>
  ),
  shield: (
    <>
      <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  chart: (
    <>
      <path d="M4 19V5M4 19h17" />
      <path d="m7 15 4-4 3 2 6-7" />
      <path d="M17 6h3v3" />
    </>
  ),
  search: (
    <>
      <circle cx="10.8" cy="10.8" r="6.8" />
      <path d="m16 16 4.5 4.5" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" />
    </>
  ),
  chevron: <path d="m7 10 5 5 5-5" />,
  arrow: (
    <>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </>
  ),
  logout: (
    <>
      <path d="M10 17l5-5-5-5M15 12H3" />
      <path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14M5 12h14" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  close: (
    <>
      <path d="m18 6-12 12M6 6l12 12" />
    </>
  ),
  menu: (
    <>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
}

export function Icon({ name, size = 18, className = '' }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {iconPaths[name] || iconPaths.grid}
    </svg>
  )
}

export function Button({ children, variant = 'primary', className = '', ...props }) {
  return (
    <button className={`button button--${variant} ${className}`} {...props}>
      {children}
    </button>
  )
}

export function Badge({ children, tone = 'neutral' }) {
  return <span className={`badge badge--${tone}`}>{children}</span>
}

export function StatCard({ label, value, change, icon, tone = 'blue' }) {
  return (
    <article className="stat-card">
      <div className={`stat-card__icon stat-card__icon--${tone}`}>
        <Icon name={icon} />
      </div>
      <span className="stat-card__label">{label}</span>
      <div className="stat-card__value">{value}</div>
      {change && <span className="stat-card__change">{change}</span>}
    </article>
  )
}

export function PageIntro({ eyebrow, title, subtitle, action }) {
  return (
    <div className="page-intro">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function AppLayout({
  activePath,
  title,
  subtitle,
  role,
  profile,
  onSaveProfile,
  onRoleChange,
  onNavigate,
  onSignOut,
  onChangePassword,
  darkMode,
  onToggleDarkMode,
  toast,
  children,
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const closeSettings = () => setSettingsOpen(false)
  useEffect(() => {
    if (!mobileOpen) return undefined
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setMobileOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [mobileOpen])
  const profileInitials = profile.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')
  const groups = {
    Student: [
      { path: '/catalog', label: 'Uniform catalog', icon: 'bag' },
      { path: '/orders', label: 'My orders', icon: 'receipt' },
    ],
    Finance: [
      { path: '/finance', label: 'Payments', icon: 'receipt' },
      { path: '/orders', label: 'Order overview', icon: 'bag' },
    ],
    Administrator: [
      { path: '/admin', label: 'Mother Admin', icon: 'shield' },
      { path: '/finance', label: 'Payments', icon: 'receipt' },
      { path: '/reports', label: 'Reports', icon: 'chart' },
    ],
  }
  const items = groups[role] || groups.Student

  return (
    <div className="app-shell">
      <aside
        id="workspace-sidebar"
        className={`sidebar ${mobileOpen ? 'sidebar--open' : ''} ${sidebarCollapsed ? 'sidebar--collapsed' : ''}`}
        aria-label="Workspace navigation"
      >
        <div className="sidebar__header">
          <a
            href="/catalog"
            className="brand"
            aria-label="Uniorder home"
            onClick={(event) => {
              event.preventDefault()
              onNavigate('/catalog')
              setMobileOpen(false)
            }}
          >
            <span className="brand__mark">u</span>
            <span className="sidebar__wordmark">
              uniorder<span className="brand__dot">.</span>
            </span>
          </a>
          <button
            type="button"
            className="icon-button sidebar__collapse"
            onClick={() => setSidebarCollapsed((current) => !current)}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-controls="workspace-sidebar"
            aria-expanded={!sidebarCollapsed}
          >
            <Icon name="menu" />
          </button>
          <button
            type="button"
            className="icon-button sidebar__close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <Icon name="close" />
          </button>
        </div>
        <div className="sidebar__section-label">WORKSPACE</div>
        <nav className="sidebar__nav" aria-label="Main navigation">
          {items.map((item) => (
            <button
              key={item.path}
              type="button"
              className={`nav-item ${activePath === item.path ? 'nav-item--active' : ''}`}
              aria-label={item.label}
              title={sidebarCollapsed ? item.label : undefined}
              onClick={() => {
                onNavigate(item.path)
                setMobileOpen(false)
              }}
            >
              <Icon name={item.icon} />
              <span className="nav-item__label">{item.label}</span>
              {item.path === '/orders' && <span className="nav-item__count">3</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar__bottom">
          <div className="sidebar__role-label">DEMO ROLE</div>
          <label className="role-select-wrap">
            <span className="sr-only">Switch demo role</span>
            <select
              value={role}
              onChange={(event) => {
                onRoleChange(event.target.value)
                setMobileOpen(false)
              }}
            >
              {Object.keys(groups).map((name) => (
                <option key={name} value={name}>
                  {name === 'Administrator' ? 'Mother Admin' : name}
                </option>
              ))}
            </select>
            <Icon name="chevron" size={15} />
          </label>
          <div className="sidebar__profile">
            <div className="avatar">
              {role === 'Student'
                ? profileInitials
                : role === 'Administrator'
                  ? 'MA'
                  : role.slice(0, 2).toUpperCase()}
            </div>
            <div className="sidebar__profile-text">
              <strong>
                {role === 'Student'
                  ? profile.name
                  : `${role === 'Administrator' ? 'Mother Admin' : role} account`}
              </strong>
              <span>{role === 'Student' ? profile.schoolId : 'Demo workspace'}</span>
            </div>
            <button
              type="button"
              className="icon-button sidebar__logout"
              onClick={onSignOut}
              aria-label="Sign out"
            >
              <Icon name="logout" size={16} />
            </button>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button
            type="button"
            className="icon-button mobile-menu"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-controls="workspace-sidebar"
            aria-expanded={mobileOpen}
          >
            <Icon name={mobileOpen ? 'close' : 'menu'} />
          </button>
          <div className="topbar__breadcrumb">
            Workspace <span>/</span> <strong>{title}</strong>
          </div>
          <div className="topbar__actions">
            <button type="button" className="icon-button notification-button" aria-label="Notifications">
              <Icon name="bell" />
              <span />
            </button>
            <button
              type="button"
              className="profile-settings-trigger"
              onClick={() => setSettingsOpen(true)}
              aria-label={`Open profile settings for ${profile.name}`}
            >
              <span className="profile-settings-trigger__avatar">{profileInitials}</span>
              <span className="profile-settings-trigger__label">Profile settings</span>
              <Icon name="settings" size={16} />
            </button>
          </div>
        </header>
        <section className="page-content" aria-label={title}>
          <div className="content-heading">
            <div>
              <h1>{title}</h1>
              <p>{subtitle}</p>
            </div>
            <div className="date-chip">
              <Icon name="clock" size={15} /> Today's Session
            </div>
          </div>
          {children}
        </section>
      </main>
      {mobileOpen && (
        <button
          className="sidebar-scrim"
          type="button"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      )}
      {settingsOpen && (
        <ProfileSettings
          profile={profile}
          darkMode={darkMode}
          onToggleDarkMode={onToggleDarkMode}
          onSave={onSaveProfile}
          onChangePassword={onChangePassword}
          onSignOut={onSignOut}
          onClose={closeSettings}
        />
      )}
      {toast && (
        <div className="toast" role="status">
          <span>
            <Icon name="check" size={16} />
          </span>
          {toast}
        </div>
      )}
    </div>
  )
}

export function ProductArtwork({ color, tone = 'shirt', name = 'School uniform' }) {
  if (tone === 'trousers') {
    return (
      <svg className="product-art product-art--trousers" viewBox="0 0 180 150" role="img" aria-label="Uniform trousers">
        <path d="M52 22h76l-7 105H91l-2-64-3 64H57L52 22Z" fill={color} />
        <path d="M53 22h75M88 24v38" fill="none" stroke="rgba(255,255,255,.38)" strokeWidth="3" />
      </svg>
    )
  }
  if (tone === 'skirt') {
    return (
      <svg className="product-art product-art--skirt" viewBox="0 0 180 150" role="img" aria-label={name}>
        <path d="M61 24h58l17 100H44L61 24Z" fill={color} />
        <path d="M61 24h58M70 28l-8 92m25-92v92m25-92 8 92" fill="none" stroke="rgba(255,255,255,.38)" strokeWidth="3" />
      </svg>
    )
  }
  if (tone === 'cardigan') {
    return (
      <svg className="product-art product-art--cardigan" viewBox="0 0 180 150" role="img" aria-label={name}>
        <path d="m54 23 24-10h24l24 10 23 23-17 17-13-13v76H61V50L48 63 31 46l23-23Z" fill={color} />
        <path d="m78 13 12 22 12-22M90 35v89m-8-76h16" fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="2.5" />
        <circle cx="86" cy="53" r="1.8" fill="#fff" />
        <circle cx="86" cy="68" r="1.8" fill="#fff" />
        <circle cx="86" cy="83" r="1.8" fill="#fff" />
        <circle cx="86" cy="98" r="1.8" fill="#fff" />
      </svg>
    )
  }
  if (tone === 'polo') {
    return (
      <svg className="product-art product-art--polo" viewBox="0 0 180 150" role="img" aria-label={name}>
        <path d="m54 23 24-10h24l24 10 23 23-17 17-13-13v76H61V50L48 63 31 46l23-23Z" fill={color} />
        <path d="m78 13 12 13 12-13-5 20H83l-5-20Zm12 20v91m-25-74v75m50-75v75" fill="none" stroke="rgba(255,255,255,.45)" strokeWidth="2.5" />
        <path d="M90 33v16m0-10h6" fill="none" stroke="rgba(15,23,42,.45)" strokeWidth="2" />
      </svg>
    )
  }
  if (tone === 'oxford') {
    return (
      <svg className="product-art product-art--oxford" viewBox="0 0 180 150" role="img" aria-label={name}>
        <path d="m54 23 24-10h24l24 10 23 23-17 17-13-13v76H61V50L48 63 31 46l23-23Z" fill={color} />
        <path d="m78 13 12 16 12-16M90 29v95M65 50v75M115 50v75" fill="none" stroke="rgba(100,116,139,.48)" strokeWidth="2.5" />
        <circle cx="94" cy="46" r="1.6" fill="#94a3b8" />
        <circle cx="94" cy="62" r="1.6" fill="#94a3b8" />
        <circle cx="94" cy="78" r="1.6" fill="#94a3b8" />
      </svg>
    )
  }
  return (
    <svg className="product-art product-art--sports-tee" viewBox="0 0 180 150" role="img" aria-label={name}>
      <path d="m48 24 28-11h28l28 11 24 29-20 14-13-17v64H57V50L44 67 24 53l24-29Z" fill={color} />
      <path
        d="m78 13 12 13 12-13M90 26v88M61 51v63M119 51v63"
        fill="none"
        stroke="rgba(255,255,255,.35)"
        strokeWidth="2.5"
      />
    </svg>
  )
}
