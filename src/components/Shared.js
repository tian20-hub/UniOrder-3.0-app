import React, { useState } from 'react'

const iconPaths = {
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
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
  onRoleChange,
  onNavigate,
  onSignOut,
  toast,
  children,
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const groups = {
    Student: [
      { path: '/catalog', label: 'Program catalog', icon: 'grid' },
      { path: '/orders', label: 'My orders', icon: 'receipt' },
    ],
    Staff: [
      { path: '/inventory', label: 'Inventory', icon: 'package' },
      { path: '/orders', label: 'Orders', icon: 'receipt' },
    ],
    Finance: [
      { path: '/finance', label: 'Payments', icon: 'receipt' },
      { path: '/orders', label: 'Order overview', icon: 'bag' },
    ],
    Administrator: [
      { path: '/admin', label: 'System control', icon: 'shield' },
      { path: '/inventory', label: 'Inventory', icon: 'package' },
      { path: '/finance', label: 'Payments', icon: 'receipt' },
      { path: '/reports', label: 'Reports', icon: 'chart' },
    ],
  }
  const items = groups[role] || groups.Student

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? 'sidebar--open' : ''}`}>
        <a
          href="/catalog"
          className="brand"
          onClick={(event) => {
            event.preventDefault()
            onNavigate('/catalog')
            setMobileOpen(false)
          }}
        >
          <span className="brand__mark">u</span>
          <span>
            uniorder<span className="brand__dot">.</span>
          </span>
        </a>
        <div className="sidebar__section-label">WORKSPACE</div>
        <nav className="sidebar__nav" aria-label="Main navigation">
          {items.map((item) => (
            <button
              key={item.path}
              type="button"
              className={`nav-item ${activePath === item.path ? 'nav-item--active' : ''}`}
              onClick={() => {
                onNavigate(item.path)
                setMobileOpen(false)
              }}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
              {item.path === '/orders' && <span className="nav-item__count">3</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar__bottom">
          <div className="sidebar__role-label">DEMO ROLE</div>
          <label className="role-select-wrap">
            <span className="sr-only">Switch demo role</span>
            <select value={role} onChange={(event) => onRoleChange(event.target.value)}>
              {Object.keys(groups).map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
            <Icon name="chevron" size={15} />
          </label>
          <div className="sidebar__profile">
            <div className="avatar">{role === 'Student' ? 'AM' : role.slice(0, 2).toUpperCase()}</div>
            <div className="sidebar__profile-text">
              <strong>{role === 'Student' ? 'Amina Mekonnen' : `${role} account`}</strong>
              <span>{role === 'Student' ? 'Grade 11 · Blue Nile' : 'Demo workspace'}</span>
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
            aria-label="Open menu"
          >
            <Icon name="menu" />
          </button>
          <div className="topbar__breadcrumb">
            Workspace <span>/</span> <strong>{title}</strong>
          </div>
          <div className="topbar__actions">
            <span className="campus-label">
              <span className="campus-label__dot" /> Blue Nile Academy
            </span>
            <button type="button" className="icon-button notification-button" aria-label="Notifications">
              <Icon name="bell" />
              <span />
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

export function ProductArtwork({ color, tone = 'shirt' }) {
  if (tone === 'trousers') {
    return (
      <svg className="product-art product-art--trousers" viewBox="0 0 180 150" role="img" aria-label="Uniform trousers">
        <path d="M52 22h76l-7 105H91l-2-64-3 64H57L52 22Z" fill={color} />
        <path d="M53 22h75M88 24v38" fill="none" stroke="rgba(255,255,255,.38)" strokeWidth="3" />
      </svg>
    )
  }
  return (
    <svg className="product-art" viewBox="0 0 180 150" role="img" aria-label="School uniform top">
      <path d="m54 23 24-10h24l24 10 23 23-17 17-13-13v76H61V50L48 63 31 46l23-23Z" fill={color} />
      <path
        d="m78 13 12 13 12-13M90 26v98M65 50v75M115 50v75"
        fill="none"
        stroke="rgba(255,255,255,.35)"
        strokeWidth="2.5"
      />
    </svg>
  )
}
