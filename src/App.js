import React, { useCallback, useEffect, useState } from 'react'
import Login from './components/Login'
import ResetPassword from './components/ResetPassword'
import StudentCatalog from './components/StudentCatalog'
import OrderHistory from './components/OrderHistory'
import FinancePayments from './components/FinancePayments'
import MotherAdmin from './components/MotherAdmin'
import Reports from './components/Reports'
import { AppLayout } from './components/Shared'
import { courses } from './data/courses'
import { defaultAdminSettings } from './data/adminSettings'
import { convertEtbToPhp } from './utils/currency'
import { isSupabaseConfigured, supabase } from './lib/supabase'

const pageDetails = {
  '/catalog': { title: 'Student Uniform Catalog', subtitle: 'Search by course and order available uniforms.' },
  '/orders': { title: 'Order history', subtitle: 'Track your uniform orders from request to pickup.' },
  '/finance': { title: 'Payments', subtitle: 'Review payments and release completed orders.' },
  '/admin': { title: 'Mother Admin', subtitle: 'Manage accounts, stock, checkout rules, and campus policies.' },
  '/reports': { title: 'Reports', subtitle: 'A clear view of orders, inventory, and revenue.' },
}

const emptyProfile = {
  name: '',
  schoolId: '',
  email: '',
  grade: '',
  course: courses[0],
  orderUpdates: true,
  promotions: false,
}

const roleHome = {
  Student: '/catalog',
  Finance: '/finance',
  Administrator: '/admin',
}

const demoEnabled = import.meta.env.DEV && !isSupabaseConfigured
const demoEmail = 'demo.student@uniorder.local'
const demoPassword = 'Demo123!'
const demoSessionKey = 'uniorder-local-demo-session'
const demoWorkspaceKey = 'uniorder-local-demo-workspace'

function readDemoSession() {
  if (!demoEnabled) return null
  try {
    return window.sessionStorage.getItem(demoSessionKey) === 'true'
      ? { demo: true, user: { id: 'local-demo-student', email: demoEmail } }
      : null
  } catch (error) {
    console.error('Unable to restore the local demo session.', error)
    return null
  }
}

function createDemoWorkspace() {
  const createdAt = new Date().toISOString()
  const products = [
    {
      id: 'demo-nursing-uniform',
      name: 'Nursing Uniform - Demo Set',
      course: 'BS Nursing',
      courseLabel: 'BS Nursing',
      category: 'Uniforms',
      color: 'Nursing blue',
      priceEtb: 2570,
      price: convertEtbToPhp(2570),
      stock: 28,
      sizes: [
        { id: 'demo-nursing-small', label: 'S', stock: 8, minimum: 2 },
        { id: 'demo-nursing-medium', label: 'M', stock: 12, minimum: 3 },
        { id: 'demo-nursing-large', label: 'L', stock: 8, minimum: 2 },
      ],
    },
    {
      id: 'demo-it-uniform',
      name: 'IT Department Polo - Demo',
      course: 'BS Information Technology',
      courseLabel: 'BS Information Technology',
      category: 'Uniforms',
      color: 'Navy',
      priceEtb: 1850,
      price: convertEtbToPhp(1850),
      stock: 24,
      sizes: [
        { id: 'demo-it-small', label: 'S', stock: 6, minimum: 2 },
        { id: 'demo-it-medium', label: 'M', stock: 10, minimum: 3 },
        { id: 'demo-it-large', label: 'L', stock: 8, minimum: 2 },
      ],
    },
  ]
  return { catalog: products, orders: [], requests: [], notifications: [], createdAt }
}

function readDemoWorkspace() {
  try {
    const saved = window.localStorage.getItem(demoWorkspaceKey)
    return saved ? JSON.parse(saved) : createDemoWorkspace()
  } catch (error) {
    console.error('Unable to load local demo data.', error)
    return createDemoWorkspace()
  }
}

function saveDemoWorkspace(workspace) {
  try {
    window.localStorage.setItem(demoWorkspaceKey, JSON.stringify(workspace))
  } catch (error) {
    console.error('Unable to save local demo data.', error)
    throw new Error('Demo data could not be saved in this browser. Check available storage.')
  }
}

function formatDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date unavailable'
  return new Intl.DateTimeFormat('en', { month: 'short', day: '2-digit', year: 'numeric' }).format(date)
}

function toLocalDateTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

function mapProfile(row) {
  return {
    id: row.id,
    name: row.name,
    schoolId: row.school_id,
    email: row.email,
    grade: row.grade,
    course: courses.includes(row.course) ? row.course : courses[0],
    orderUpdates: row.order_updates,
    promotions: row.promotions,
    role: row.role,
    active: row.active,
  }
}

function mapProduct(row) {
  const sizes = (row.product_sizes || []).map((size) => ({
    id: size.id,
    label: size.size_label,
    stock: size.stock,
    minimum: size.minimum,
  }))
  return {
    id: row.id,
    name: row.name,
    course: row.course,
    courseLabel: row.course,
    category: row.category,
    color: row.color,
    priceEtb: Number(row.price_etb),
    price: convertEtbToPhp(Number(row.price_etb)),
    sizes,
    stock: sizes.reduce((total, size) => total + size.stock, 0),
  }
}

function mapOrder(row) {
  const orderItems = row.order_items || []
  const itemCount = orderItems.reduce((total, item) => total + item.quantity, 0)
  const submittedAt = row.submitted_at
  return {
    id: row.order_number,
    dbId: row.id,
    userId: row.user_id,
    items: `${itemCount} ${itemCount === 1 ? 'item' : 'items'}`,
    orderDetails: orderItems.map((item) => ({
      name: item.product_name,
      course: item.course,
      size: item.size_label,
      quantity: item.quantity,
      unitPrice: Number(item.unit_price_php),
    })),
    date: formatDate(submittedAt),
    submittedAt,
    submittedBy: row.profiles?.name || row.profiles?.email || 'Student',
    total: Number(row.total),
    paymentMethod: row.payment_method,
    status: row.status,
    statusHistory: [...(row.order_status_history || [])]
      .sort((first, second) => new Date(first.created_at) - new Date(second.created_at)),
  }
}

function readDarkMode() {
  try {
    return window.localStorage.getItem('uniorder-dark-mode') === 'true'
  } catch (error) {
    console.error('Unable to load dark mode preference.', error)
    return false
  }
}

function showError(error, fallback) {
  console.error(fallback, error)
  return error?.message || fallback
}

export default function App() {
  const [path, setPath] = useState(() => (
    window.location.pathname === '/' ? '/login' : window.location.pathname
  ))
  const [session, setSession] = useState(readDemoSession)
  const [authLoading, setAuthLoading] = useState(isSupabaseConfigured && !readDemoSession())
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profile, setProfile] = useState(null)
  const [workspaceLoading, setWorkspaceLoading] = useState(false)
  const [workspaceError, setWorkspaceError] = useState('')
  const [catalog, setCatalog] = useState([])
  const [inventory, setInventory] = useState([])
  const [orders, setOrders] = useState([])
  const [orderRequests, setOrderRequests] = useState([])
  const [notifications, setNotifications] = useState([])
  const [accounts, setAccounts] = useState([])
  const [adminSettings, setAdminSettings] = useState(defaultAdminSettings)
  const [darkMode, setDarkMode] = useState(readDarkMode)
  const [toast, setToast] = useState('')

  const navigate = useCallback((destination, replace = false) => {
    if (replace) window.history.replaceState({}, '', destination)
    else window.history.pushState({}, '', destination)
    setPath(destination)
  }, [])

  const loadWorkspace = useCallback(async (currentProfile) => {
    if (currentProfile?.id === 'local-demo-student') {
      const workspace = readDemoWorkspace()
      setCatalog(workspace.catalog)
      setOrders(workspace.orders)
      setOrderRequests(workspace.requests)
      setNotifications(workspace.notifications)
      setAdminSettings(defaultAdminSettings)
      setWorkspaceError('')
      return true
    }
    if (!supabase || !currentProfile) return
    setWorkspaceLoading(true)
    try {
      const tasks = [
        supabase.from('app_settings').select('settings').eq('id', 1).single(),
        supabase.from('uniform_orders')
          .select('*, order_items(*), order_status_history(*), profiles!uniform_orders_user_id_fkey(name,email)')
          .order('submitted_at', { ascending: false }),
        supabase.from('order_notifications')
          .select('id, order_id, message, created_at, read_at')
          .order('created_at', { ascending: false })
          .limit(30),
      ]
      if (currentProfile.role === 'Student') {
        tasks.push(supabase.from('catalog_products')
          .select('*, product_sizes(*)')
          .eq('active', true)
          .order('course'))
      }
      if (['Finance', 'Administrator'].includes(currentProfile.role)) {
        tasks.push(supabase.from('order_requests')
          .select('*, uniform_orders(order_number)')
          .order('created_at', { ascending: false }))
      } else {
        tasks.push(supabase.from('order_requests')
          .select('*, uniform_orders(order_number)')
          .order('created_at', { ascending: false }))
      }
      if (currentProfile.role === 'Administrator') {
        tasks.push(supabase.rpc('admin_list_profiles'))
        tasks.push(supabase.from('catalog_products')
          .select('*, product_sizes(*)')
          .order('course'))
      }

      const results = await Promise.all(tasks)
      const failures = results.find((result) => result.error)
      if (failures?.error) throw failures.error

      const [settingsResult, ordersResult, notificationsResult] = results
      const nextSettings = {
        ...settingsResult.data.settings,
        orderDeadline: toLocalDateTime(settingsResult.data.settings.orderDeadline),
      }
      setAdminSettings((current) => (
        JSON.stringify(current) === JSON.stringify(nextSettings) ? current : nextSettings
      ))
      setOrders((ordersResult.data || []).map(mapOrder))
      setNotifications(notificationsResult.data || [])

      let resultIndex = 3
      if (currentProfile.role === 'Student') {
        setCatalog((results[resultIndex].data || []).map(mapProduct))
        setInventory([])
        resultIndex += 1
      } else {
        setCatalog([])
      }
      setOrderRequests((results[resultIndex].data || []).map((request) => ({
        ...request,
        orderNumber: request.uniform_orders?.order_number || 'Order',
      })))
      resultIndex += 1
      if (currentProfile.role === 'Administrator') {
        setAccounts(results[resultIndex].data || [])
        setInventory((results[resultIndex + 1].data || []).map(mapProduct))
      } else {
        setAccounts([])
        setInventory([])
      }
      setWorkspaceError('')
      return true
    } catch (error) {
      const message = showError(error, 'Unable to load the workspace. Check your Supabase setup and try again.')
      setWorkspaceError(message)
      setToast(message)
      return false
    } finally {
      setWorkspaceLoading(false)
    }
  }, [])

  useEffect(() => {
    const syncPath = () => setPath(window.location.pathname)
    window.addEventListener('popstate', syncPath)
    return () => window.removeEventListener('popstate', syncPath)
  }, [])

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
    if (!supabase) {
      setAuthLoading(false)
      return undefined
    }
    let mounted = true
    supabase.auth.getSession()
      .then(({ data, error }) => {
        if (error) throw error
        if (mounted) {
          setSession(data.session)
          setAuthLoading(false)
        }
      })
      .catch((error) => {
        if (mounted) {
          setToast(showError(error, 'Unable to restore your session.'))
          setAuthLoading(false)
        }
      })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      if (!nextSession) {
        setProfile(null)
        setCatalog([])
        setOrders([])
        setOrderRequests([])
        setNotifications([])
        setInventory([])
        setAccounts([])
      }
      setAuthLoading(false)
    })
    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (session?.demo) {
      setProfile({
        id: 'local-demo-student',
        name: 'Demo Student',
        schoolId: 'DEMO-001',
        email: demoEmail,
        grade: 'Demo',
        course: courses[0],
        orderUpdates: true,
        promotions: false,
        role: 'Student',
        active: true,
      })
      setProfileLoading(false)
      setProfileError('')
      return undefined
    }
    if (!session?.user || !supabase) {
      setProfile(null)
      setProfileLoading(false)
      setProfileError('')
      return
    }
    let mounted = true
    const loadProfile = async () => {
      setProfileLoading(true)
      setProfileError('')
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
      if (error) throw error
      if (!data.active) {
        await supabase.auth.signOut()
        throw new Error('This account is paused. Contact your campus administrator.')
      }
      const nextProfile = mapProfile(data)
      if (mounted) {
        setProfile(nextProfile)
        setProfileLoading(false)
      }
    }
    loadProfile().catch((error) => {
      setToast(showError(error, 'Unable to load your account.'))
      if (mounted) {
        setProfile(null)
        setProfileError(error.message || 'Unable to load your account.')
        setProfileLoading(false)
      }
    })
    return () => { mounted = false }
  }, [session])

  useEffect(() => {
    if (profile) loadWorkspace(profile)
  }, [profile, loadWorkspace])

  useEffect(() => {
    if (!session || !profile || !supabase) return undefined
    const refresh = () => loadWorkspace(profile)
    const channel = supabase.channel(`uniorder-workspace-${session.user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'uniform_orders' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'product_sizes' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'order_requests' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'order_notifications' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_settings' }, refresh)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [session, profile, loadWorkspace])

  useEffect(() => {
    if (!toast) return undefined
    const timeout = window.setTimeout(() => setToast(''), 4500)
    return () => window.clearTimeout(timeout)
  }, [toast])

  useEffect(() => {
    if (!profile) return
    const isAuthenticationPage = ['/login', '/signup'].includes(path)
    if (isAuthenticationPage) navigate(roleHome[profile.role], true)
    else if (path === '/reset-password') return
    else if (!pageDetails[path]) navigate(roleHome[profile.role], true)
    else if (profile.role === 'Student' && !['/catalog', '/orders'].includes(path)) {
      navigate(roleHome.Student, true)
    } else if (profile.role === 'Finance' && !['/finance', '/orders'].includes(path)) {
      navigate(roleHome.Finance, true)
    } else if (profile.role === 'Administrator' && !['/admin', '/finance', '/reports'].includes(path)) {
      navigate(roleHome.Administrator, true)
    }
  }, [path, profile, navigate])

  useEffect(() => {
    if (!session && !['/login', '/signup', '/reset-password'].includes(path)) {
      navigate('/login', true)
    }
  }, [session, path, navigate])

  const handleSignIn = async (email, password) => {
    if (demoEnabled && email.toLowerCase() === demoEmail && password === demoPassword) {
      try {
        window.sessionStorage.setItem(demoSessionKey, 'true')
      } catch (error) {
        console.error('Unable to save the local demo session.', error)
        throw new Error('Browser session storage is unavailable. Enable storage and try again.')
      }
      setSession({ demo: true, user: { id: 'local-demo-student', email: demoEmail } })
      setProfileError('')
      navigate('/catalog', true)
      return
    }
    if (!supabase) throw new Error('Use the local demo account shown on this page.')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const handleSignUp = async (name, email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    })
    if (error) throw error
    return { confirmationRequired: !data.session }
  }

  const signOut = async () => {
    if (session?.demo) {
      try {
        window.sessionStorage.removeItem(demoSessionKey)
      } catch (error) {
        console.error('Unable to clear the local demo session.', error)
      }
      setSession(null)
      setProfile(null)
      setCatalog([])
      setOrders([])
      setNotifications([])
      navigate('/login', true)
      return
    }
    if (!supabase) return
    const { error } = await supabase.auth.signOut()
    if (error) {
      setToast(showError(error, 'Unable to sign out.'))
      return
    }
    navigate('/login')
  }

  const saveProfile = async (nextProfile, successMessage = 'Profile settings saved.') => {
    if (session?.demo) {
      setProfile((current) => ({ ...current, ...nextProfile }))
      setToast(successMessage)
      return true
    }
    const { data, error } = await supabase
      .from('profiles')
      .update({
        name: nextProfile.name.trim(),
        school_id: nextProfile.schoolId.trim(),
        grade: nextProfile.grade.trim(),
        course: nextProfile.course,
        order_updates: nextProfile.orderUpdates,
        promotions: nextProfile.promotions,
      })
      .eq('id', profile.id)
      .select('*')
      .single()
    if (error) {
      setToast(showError(error, 'Unable to save profile settings.'))
      return false
    }
    setProfile(mapProfile(data))
    setToast(successMessage)
    return true
  }

  const createOrder = async (orderLines, _total, paymentMethod) => {
    if (session?.demo) {
      const workspace = readDemoWorkspace()
      const requestedItems = []
      for (const line of orderLines) {
        const product = workspace.catalog.find((item) => item.id === line.id)
        const size = product?.sizes.find((item) => item.id === line.sizeId)
        if (!product || !size || size.stock < line.quantity) {
          setToast(`Stock changed for ${line.name} size ${line.size}. Refresh and try again.`)
          return false
        }
        requestedItems.push({ line, product, size })
      }
      for (const { line, size } of requestedItems) size.stock -= line.quantity
      workspace.catalog = workspace.catalog.map((product) => ({
        ...product,
        stock: product.sizes.reduce((total, size) => total + size.stock, 0),
      }))
      const now = new Date().toISOString()
      const itemCount = orderLines.reduce((total, line) => total + line.quantity, 0)
      const total = requestedItems.reduce((amount, { line, product }) => amount + product.price * line.quantity, 0)
      const order = {
        id: `DEMO-${Date.now().toString().slice(-8)}`,
        dbId: `demo-${Date.now()}`,
        userId: 'local-demo-student',
        items: `${itemCount} ${itemCount === 1 ? 'item' : 'items'}`,
        orderDetails: requestedItems.map(({ line, product }) => ({
          name: product.name,
          course: product.course,
          size: line.size,
          quantity: line.quantity,
          unitPrice: product.price,
        })),
        date: formatDate(now),
        submittedAt: now,
        submittedBy: 'Demo Student',
        total,
        paymentMethod,
        status: 'Awaiting payment',
        statusHistory: [{ previous_status: null, next_status: 'Awaiting payment', created_at: now }],
      }
      workspace.orders = [order, ...workspace.orders]
      workspace.notifications = [{
        id: `demo-notification-${Date.now()}`,
        order_id: order.dbId,
        message: `Your order ${order.id} was received.`,
        created_at: now,
        read_at: null,
      }, ...workspace.notifications]
      try {
        saveDemoWorkspace(workspace)
      } catch (error) {
        setToast(error.message)
        return false
      }
      setCatalog(workspace.catalog)
      setOrders(workspace.orders)
      setNotifications(workspace.notifications)
      setToast('Demo order placed. Stock was reserved in this browser.')
      navigate('/orders')
      return true
    }
    const { error } = await supabase.rpc('place_uniform_order', {
      p_items: orderLines.map((item) => ({
        product_id: item.id,
        size_id: item.sizeId,
        quantity: item.quantity,
      })),
      p_payment_method: paymentMethod,
    })
    if (error) {
      setToast(showError(error, 'Unable to place this order. Refresh the catalog and try again.'))
      return false
    }
    await loadWorkspace(profile)
    setToast('Your order has been placed. Stock has been reserved.')
    navigate('/orders')
    return true
  }

  const cancelOrder = async (order) => {
    if (session?.demo) {
      const workspace = readDemoWorkspace()
      const savedOrder = workspace.orders.find((item) => item.dbId === order.dbId)
      if (!savedOrder || savedOrder.status !== 'Awaiting payment') return false
      for (const detail of savedOrder.orderDetails) {
        const product = workspace.catalog.find((item) => item.name === detail.name)
        const size = product?.sizes.find((item) => item.label === detail.size)
        if (size) size.stock += detail.quantity
      }
      workspace.catalog = workspace.catalog.map((product) => ({
        ...product,
        stock: product.sizes.reduce((total, size) => total + size.stock, 0),
      }))
      const now = new Date().toISOString()
      workspace.orders = workspace.orders.map((item) => item.dbId === order.dbId
        ? { ...item, status: 'Cancelled', statusHistory: [...item.statusHistory, {
          previous_status: 'Awaiting payment',
          next_status: 'Cancelled',
          created_at: now,
        }] }
        : item)
      try {
        saveDemoWorkspace(workspace)
      } catch (error) {
        setToast(error.message)
        return false
      }
      setCatalog(workspace.catalog)
      setOrders(workspace.orders)
      setToast(`${order.id} was cancelled and demo stock returned.`)
      return true
    }
    const { error } = await supabase.rpc('cancel_own_order', { p_order_id: order.dbId })
    if (error) {
      setToast(showError(error, 'Unable to cancel this order.'))
      return false
    }
    await loadWorkspace(profile)
    setToast(`${order.id} was cancelled and its stock returned.`)
    return true
  }

  const requestOrderChange = async (order, type, message) => {
    if (session?.demo) {
      const workspace = readDemoWorkspace()
      const request = {
        id: `demo-request-${Date.now()}`,
        order_id: order.dbId,
        orderNumber: order.id,
        request_type: type,
        message,
        status: 'Open',
        created_at: new Date().toISOString(),
      }
      workspace.requests = [request, ...workspace.requests]
      try {
        saveDemoWorkspace(workspace)
      } catch (error) {
        setToast(error.message)
        return false
      }
      setOrderRequests(workspace.requests)
      setToast(`${type} request submitted for ${order.id}.`)
      return true
    }
    const { error } = await supabase.rpc('create_order_request', {
      p_order_id: order.dbId,
      p_type: type,
      p_message: message,
    })
    if (error) {
      setToast(showError(error, `Unable to submit the ${type.toLowerCase()} request.`))
      return false
    }
    await loadWorkspace(profile)
    setToast(`${type} request submitted for ${order.id}.`)
    return true
  }

  const updateOrderStatus = async (order, status) => {
    const { error } = await supabase.rpc('update_order_status', {
      p_order_id: order.dbId,
      p_next_status: status,
    })
    if (error) {
      setToast(showError(error, 'Unable to update this order.'))
      return false
    }
    await loadWorkspace(profile)
    setToast(`${order.id} is now ${status.toLowerCase()}.`)
    return true
  }

  const resolveOrderRequest = async (request, status) => {
    const { error } = await supabase.rpc('resolve_order_request', {
      p_request_id: request.id,
      p_status: status,
    })
    if (error) {
      setToast(showError(error, 'Unable to update this request.'))
      return false
    }
    await loadWorkspace(profile)
    setToast(`Request for ${request.orderNumber} marked ${status.toLowerCase()}.`)
    return true
  }

  const saveSettings = async (settings) => {
    const settingsForDatabase = {
      ...settings,
      orderDeadline: settings.orderDeadline
        ? new Date(settings.orderDeadline).toISOString()
        : '',
      maxItemsPerOrder: Number(settings.maxItemsPerOrder) || 0,
    }
    const { error } = await supabase.rpc('admin_save_settings', { p_settings: settingsForDatabase })
    if (error) {
      setToast(showError(error, 'Unable to save campus settings.'))
      return false
    }
    setAdminSettings({
      ...settingsForDatabase,
      orderDeadline: toLocalDateTime(settingsForDatabase.orderDeadline),
    })
    setToast('Mother Admin settings saved.')
    return true
  }

  const saveProduct = async (product) => {
    const { error } = await supabase.rpc('admin_save_catalog_product', {
      p_product_id: product.id || null,
      p_name: product.name,
      p_course: product.course,
      p_category: product.category,
      p_color: product.color,
      p_price_etb: Number(product.priceEtb),
      p_sizes: product.sizes,
    })
    if (error) {
      setToast(showError(error, 'Unable to save this uniform.'))
      return false
    }
    await loadWorkspace(profile)
    setToast(`${product.name} saved to the catalog and inventory.`)
    return true
  }

  const adjustStock = async (size, amount) => {
    const { error } = await supabase.rpc('admin_adjust_stock', {
      p_size_id: size.id,
      p_delta: amount,
    })
    if (error) {
      setToast(showError(error, 'Unable to adjust stock.'))
      return false
    }
    await loadWorkspace(profile)
    return true
  }

  const inviteUser = async (invite) => {
    const { error } = await supabase.functions.invoke('invite-user', { body: invite })
    if (error) {
      setToast(showError(error, 'Unable to send this invitation. Deploy the invite-user function and try again.'))
      return false
    }
    await loadWorkspace(profile)
    setToast(`Invitation sent to ${invite.email}.`)
    return true
  }

  const setAccountRole = async (account, role) => {
    const { error } = await supabase.rpc('admin_set_profile_role', {
      p_user_id: account.id,
      p_role: role,
    })
    if (error) {
      setToast(showError(error, 'Unable to update this account role.'))
      return false
    }
    await loadWorkspace(profile)
    setToast(`${account.name}'s role was updated.`)
    return true
  }

  const setAccountAccess = async (account, active) => {
    const { error } = await supabase.rpc('admin_set_profile_access', {
      p_user_id: account.id,
      p_active: active,
    })
    if (error) {
      setToast(showError(error, 'Unable to update account access.'))
      return false
    }
    await loadWorkspace(profile)
    setToast(`${account.name}'s access was ${active ? 'activated' : 'paused'}.`)
    return true
  }

  const markNotificationRead = async (notification) => {
    if (notification.read_at) return
    if (session?.demo) {
      const workspace = readDemoWorkspace()
      const readAt = new Date().toISOString()
      workspace.notifications = workspace.notifications.map((item) => (
        item.id === notification.id ? { ...item, read_at: readAt } : item
      ))
      try {
        saveDemoWorkspace(workspace)
      } catch (error) {
        setToast(error.message)
        return
      }
      setNotifications(workspace.notifications)
      return
    }
    const { error } = await supabase
      .from('order_notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notification.id)
    if (error) {
      setToast(showError(error, 'Unable to mark this notification as read.'))
      return
    }
    setNotifications((current) => current.map((item) => (
      item.id === notification.id ? { ...item, read_at: new Date().toISOString() } : item
    )))
  }

  if (authLoading || profileLoading || (session && !profile && !profileError && !path.endsWith('reset-password'))) {
    return <main className="auth-loading" role="status">Connecting to your campus workspace…</main>
  }

  if (path === '/login' || path === '/signup') {
    return (
      <Login
        onSignIn={handleSignIn}
        onSignUp={handleSignUp}
        onNavigate={navigate}
        toast={toast}
        initialMode={path === '/signup' ? 'signup' : 'login'}
        demoEnabled={demoEnabled}
        configurationError={!isSupabaseConfigured
          ? 'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local, then restart the app.'
          : ''}
      />
    )
  }
  if (path === '/reset-password') {
    return (
      <ResetPassword
        onNavigate={navigate}
        authenticated={Boolean(session)}
        onComplete={() => {
          if (session) navigate(roleHome[profile?.role] || '/login', true)
        }}
      />
    )
  }
  if (!session || !profile) {
    if (session && profileError) {
      return (
        <main className="auth-loading" role="alert">
          <div>
            <p>{profileError}</p>
            <button type="button" onClick={signOut}>Sign out and try again</button>
          </div>
        </main>
      )
    }
    return null
  }

  const detail = pageDetails[path] || pageDetails[roleHome[profile.role]]
  const orderCount = orders.filter((order) => !['Completed', 'Cancelled'].includes(order.status)).length
  const unreadCount = notifications.filter((notification) => !notification.read_at).length
  const pageProps = { onNotify: setToast, adminSettings }
  let page

  switch (path) {
    case '/orders':
      page = (
        <OrderHistory
          orders={orders}
          requests={orderRequests}
          role={profile.role}
          onNotify={setToast}
          onCancelOrder={cancelOrder}
          onRequestChange={requestOrderChange}
        />
      )
      break
    case '/finance':
      page = (
        <FinancePayments
          orders={orders}
          requests={orderRequests}
          onUpdateOrder={updateOrderStatus}
          onResolveRequest={resolveOrderRequest}
          {...pageProps}
        />
      )
      break
    case '/admin':
      page = (
        <MotherAdmin
          accounts={accounts}
          onInviteUser={inviteUser}
          onSetAccountRole={setAccountRole}
          onSetAccountAccess={setAccountAccess}
          inventory={inventory}
          onSaveProduct={saveProduct}
          onAdjustStock={adjustStock}
          onSaveSettings={saveSettings}
          {...pageProps}
        />
      )
      break
    case '/reports':
      page = <Reports orders={orders} />
      break
    case '/catalog':
    default:
      page = (
        <StudentCatalog
          products={catalog}
          onCreateOrder={createOrder}
          {...pageProps}
        />
      )
      break
  }

  return (
    <AppLayout
      activePath={path}
      title={detail.title}
      subtitle={detail.subtitle}
      role={profile.role}
      profile={profile}
      onSaveProfile={saveProfile}
      darkMode={darkMode}
      onToggleDarkMode={() => setDarkMode((current) => !current)}
      onChangePassword={() => navigate('/reset-password')}
      onNavigate={navigate}
      onSignOut={signOut}
      toast={toast}
      notifications={notifications}
      unreadCount={unreadCount}
      orderCount={orderCount}
      onReadNotification={markNotificationRead}
    >
      {session.demo && (
        <div className="demo-mode-banner" role="status">
          Local demo mode: changes are stored only in this browser and are not shared with Supabase.
          <button type="button" onClick={() => {
            try {
              window.localStorage.removeItem(demoWorkspaceKey)
            } catch (error) {
              console.error('Unable to reset local demo data.', error)
              setToast('Could not reset demo data in this browser.')
              return
            }
            loadWorkspace(profile)
            setToast('Local demo data was reset.')
          }}>Reset demo data</button>
        </div>
      )}
      {workspaceLoading && <div className="workspace-loading" role="status">Refreshing workspace data…</div>}
      {workspaceError && (
        <div className="workspace-error" role="alert">
          <span>{workspaceError}</span>
          <button type="button" onClick={() => loadWorkspace(profile)}>Retry</button>
        </div>
      )}
      {page}
    </AppLayout>
  )
}
