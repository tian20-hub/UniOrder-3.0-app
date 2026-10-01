import React, { useEffect, useState } from 'react'
import Login from './components/Login'
import ResetPassword from './components/ResetPassword'
import StudentCatalog from './components/StudentCatalog'
import OrderHistory from './components/OrderHistory'
import Inventory from './components/Inventory'
import FinancePayments from './components/FinancePayments'
import MotherAdmin from './components/MotherAdmin'
import Reports from './components/Reports'
import { AppLayout } from './components/Shared'
import { courses } from './data/courses'
import { readInventory } from './data/inventory'
import { convertEtbToPhp } from './utils/currency'

const pageDetails = {
  '/catalog': { title: 'Student Uniform Catalog', subtitle: 'Search by course and order available uniforms.' },
  '/orders': { title: 'Order history', subtitle: 'Track your uniform orders from request to pickup.' },
  '/inventory': { title: 'Inventory', subtitle: 'Keep stock accurate and ready for the next order.' },
  '/finance': { title: 'Payments', subtitle: 'Review payments and release completed orders.' },
  '/admin': { title: 'System control', subtitle: 'Manage access and keep your campus running smoothly.' },
  '/reports': { title: 'Reports', subtitle: 'A clear view of orders, inventory, and revenue.' },
}

const defaultProfile = {
  name: 'Amina Mekonnen',
  schoolId: '2024-00001',
  email: 'amina@bluenile.edu',
  grade: 'Grade 11',
  course: 'BS Information Technology',
  orderUpdates: true,
  promotions: false,
}

function readDarkMode() {
  try {
    return window.localStorage.getItem('uniorder-dark-mode') === 'true'
  } catch (error) {
    console.error('Unable to load dark mode preference.', error)
    return false
  }
}

function readProfile() {
  try {
    const saved = window.localStorage.getItem('uniorder-profile')
    if (!saved) return defaultProfile

    const profile = JSON.parse(saved)
    if (!profile || typeof profile !== 'object' || Array.isArray(profile)) return defaultProfile

    return {
      name: typeof profile.name === 'string' ? profile.name : defaultProfile.name,
      schoolId: typeof profile.schoolId === 'string' ? profile.schoolId : defaultProfile.schoolId,
      email: typeof profile.email === 'string' ? profile.email : defaultProfile.email,
      grade: typeof profile.grade === 'string' ? profile.grade : defaultProfile.grade,
      course: courses.includes(profile.course) ? profile.course : defaultProfile.course,
      orderUpdates: typeof profile.orderUpdates === 'boolean' ? profile.orderUpdates : defaultProfile.orderUpdates,
      promotions: typeof profile.promotions === 'boolean' ? profile.promotions : defaultProfile.promotions,
    }
  } catch (error) {
    console.error('Unable to load saved profile settings.', error)
    return defaultProfile
  }
}

function roleHome(role) {
  if (role === 'Staff') return '/inventory'
  if (role === 'Finance') return '/finance'
  if (role === 'Administrator') return '/admin'
  return '/catalog'
}

export default function App() {
  const [path, setPath] = useState(() => (
    window.location.pathname === '/' ? '/login' : window.location.pathname
  ))
  const [role, setRole] = useState('Student')
  const [signedIn, setSignedIn] = useState(false)
  const [profile, setProfile] = useState(readProfile)
  const [darkMode, setDarkMode] = useState(readDarkMode)
  const [inventory, setInventory] = useState(readInventory)
  const [orders, setOrders] = useState([
    { id: 'ORD-24018', items: '2 items', date: 'Oct 01, 2026', submittedAt: '2026-10-01T09:42:00+08:00', submittedBy: 'Amina Mekonnen', total: convertEtbToPhp(1250), status: 'Ready for pickup' },
    { id: 'ORD-23972', items: '1 item', date: 'Sep 24, 2026', submittedAt: '2026-09-24T14:18:00+08:00', submittedBy: 'Daniel Kebede', total: convertEtbToPhp(680), status: 'Processing' },
    { id: 'ORD-23891', items: '3 items', date: 'Sep 18, 2026', submittedAt: '2026-09-18T11:07:00+08:00', submittedBy: 'Sara Abebe', total: convertEtbToPhp(1740), status: 'Completed' },
  ])
  const [toast, setToast] = useState('')

  const navigate = (destination, replace = false) => {
    if (replace) window.history.replaceState({}, '', destination)
    else window.history.pushState({}, '', destination)
    setPath(destination)
  }

  useEffect(() => {
    const syncPath = () => setPath(window.location.pathname)
    window.addEventListener('popstate', syncPath)
    return () => window.removeEventListener('popstate', syncPath)
  }, [])

  useEffect(() => {
    const isAuth = ['/login', '/signup', '/reset-password'].includes(path)
    if (!isAuth && !signedIn) navigate('/login', true)
    if (signedIn && isAuth) navigate('/catalog', true)
  }, [path, signedIn])

  useEffect(() => {
    if (!toast) return undefined
    const timeout = window.setTimeout(() => setToast(''), 3000)
    return () => window.clearTimeout(timeout)
  }, [toast])

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light'
    try {
      window.localStorage.setItem('uniorder-dark-mode', String(darkMode))
    } catch (error) {
      console.error('Unable to save dark mode preference.', error)
      setToast('Could not save your display preference.')
    }
  }, [darkMode])

  useEffect(() => {
    try {
      window.localStorage.setItem('uniorder-inventory', JSON.stringify(inventory))
    } catch (error) {
      console.error('Unable to save inventory changes.', error)
      setToast('Could not save inventory changes. Please check your browser storage.')
    }
  }, [inventory])

  const handleSignIn = (selectedRole) => {
    setRole(selectedRole)
    setSignedIn(true)
    navigate(selectedRole === 'Student' ? '/catalog' : roleHome(selectedRole))
  }

  const saveProfile = (nextProfile, successMessage = 'Profile settings saved.') => {
    try {
      window.localStorage.setItem('uniorder-profile', JSON.stringify(nextProfile))
      setProfile(nextProfile)
      setToast(successMessage)
      return true
    } catch (error) {
      console.error('Unable to save profile settings.', error)
      setToast('Could not save profile settings. Please try again.')
      return false
    }
  }

  const createOrder = (itemNames, total) => {
    const newOrder = {
      id: `ORD-${Math.floor(24019 + Math.random() * 700)}`,
      items: `${itemNames.length} ${itemNames.length === 1 ? 'item' : 'items'}`,
      date: new Intl.DateTimeFormat('en', { month: 'short', day: '2-digit', year: 'numeric' }).format(new Date()),
      submittedAt: new Date().toISOString(),
      submittedBy: profile.name,
      total,
      status: 'Awaiting payment',
    }
    setOrders((current) => [newOrder, ...current])
    setToast('Your order has been placed.')
    navigate('/orders')
  }

  if (path === '/login' || path === '/signup') {
    return (
      <Login
        onSignIn={handleSignIn}
        onNavigate={navigate}
        toast={toast}
        initialMode={path === '/signup' ? 'signup' : 'login'}
      />
    )
  }
  if (path === '/reset-password') return <ResetPassword onNavigate={navigate} />

  const detail = pageDetails[path] || pageDetails['/catalog']
  const pageProps = { onNotify: setToast, inventory, onUpdateInventory: setInventory }
  let page

  switch (path) {
    case '/orders':
      page = <OrderHistory orders={orders} onNotify={setToast} />
      break
    case '/inventory':
      page = <Inventory {...pageProps} />
      break
    case '/finance':
      page = <FinancePayments orders={orders} onUpdateOrders={setOrders} {...pageProps} />
      break
    case '/admin':
      page = <MotherAdmin onNavigate={navigate} {...pageProps} />
      break
    case '/reports':
      page = <Reports orders={orders} />
      break
    case '/catalog':
    default:
      page = <StudentCatalog onCreateOrder={createOrder} {...pageProps} />
      break
  }

  return (
    <AppLayout
      activePath={path}
      title={detail.title}
      subtitle={detail.subtitle}
      role={role}
      profile={profile}
      onSaveProfile={saveProfile}
      orders={orders}
      darkMode={darkMode}
      onToggleDarkMode={() => setDarkMode((current) => !current)}
      onChangePassword={() => {
        setSignedIn(false)
        navigate('/reset-password')
      }}
      onRoleChange={(nextRole) => {
        setRole(nextRole)
        navigate(roleHome(nextRole))
      }}
      onNavigate={navigate}
      onSignOut={() => {
        setSignedIn(false)
        setRole('Student')
        navigate('/login')
      }}
      toast={toast}
    >
      {page}
    </AppLayout>
  )
}
