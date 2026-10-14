import { useEffect, useMemo, useState } from 'react'
import { Button, Icon } from './Shared'
import { defaultAdminSettings } from '../data/adminSettings'
import { courses } from '../data/courses'
import { formatPhp } from '../utils/currency'

const courseAbbreviations = {
  'BS Information Technology': 'BSIT',
  'BS Tourism Management': 'BSTM',
  'BS Accountancy': 'BSA',
  'BS Nursing': 'BSN',
  'BS Medical Laboratory Sciences': 'BMLS',
  'BS Psychology': 'BSP',
  'BS Radiologic Technology': 'BSRT',
  'BS Business Administration – Financial Management': 'BSBA-FM',
  'BS Business Administration – Marketing Management': 'BSBA-MM',
  'BS Hospitality Management': 'BSHM',
  'Bachelor of Elementary Education': 'BEEd',
  'Bachelor of Secondary Education – Filipino': 'BSEd-Fil',
  'Bachelor of Secondary Education – English': 'BSEd-Eng',
  'BS Criminology': 'BSCrim',
}

const filterCourseOrder = ['BS Information Technology', 'BS Tourism Management', 'BS Accountancy', 'BS Nursing']
const filterCourses = [
  ...filterCourseOrder,
  ...courses.filter((course) => !filterCourseOrder.includes(course)),
]

export default function StudentCatalog({
  products = [],
  onCreateOrder,
  onNotify,
  adminSettings = defaultAdminSettings,
}) {
  const [selectedCourse, setSelectedCourse] = useState('all')
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedQuantity, setSelectedQuantity] = useState(1)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState(adminSettings.paymentMethods[0] || '')
  const [currentTime, setCurrentTime] = useState(0)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')
  const [orderSubmitting, setOrderSubmitting] = useState(false)
  const catalogItems = products
  const deadlineTimestamp = Date.parse(adminSettings.orderDeadline || '')
  const deadlinePassed = Boolean(
    currentTime
    && adminSettings.orderDeadline
    && Number.isFinite(deadlineTimestamp)
    && currentTime > deadlineTimestamp
  )
  const selectedPaymentMethod = adminSettings.paymentMethods.includes(paymentMethod)
    ? paymentMethod
    : adminSettings.paymentMethods[0] || ''
  const orderingAvailable = adminSettings.orderingEnabled
    && !deadlinePassed
    && adminSettings.paymentMethods.length > 0

  useEffect(() => {
    const updateCurrentTime = () => setCurrentTime(Date.now())
    const initialUpdate = window.setTimeout(updateCurrentTime, 0)
    const interval = window.setInterval(updateCurrentTime, 30_000)
    return () => {
      window.clearTimeout(initialUpdate)
      window.clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (!checkoutOpen && !selectedItem) return undefined
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setCheckoutOpen(false)
        setSelectedItem(null)
      }
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [checkoutOpen, selectedItem])

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase()
    return catalogItems.filter((item) => {
      const matchesCourse = selectedCourse === 'all' || item.course === selectedCourse
      const matchesSearch = [item.course, item.courseLabel, item.name]
        .some((value) => value.toLowerCase().includes(query))
      return matchesCourse && matchesSearch
    })
  }, [catalogItems, search, selectedCourse])

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0)

  const addToCart = (item) => {
    if (!orderingAvailable) {
      onNotify(deadlinePassed ? 'The order deadline has passed.' : 'Ordering is currently unavailable.')
      return
    }
    const firstAvailableSize = item.sizes.find((size) => {
      const quantityInCart = cart.find((line) => line.id === item.id && line.size === size.label)?.quantity || 0
      return size.stock > quantityInCart
    })
    if (!firstAvailableSize) {
      onNotify(`${item.name} is out of stock.`)
      return
    }
    setSelectedItem(item)
    setSelectedSize(firstAvailableSize.label)
    setSelectedQuantity(1)
    setCheckoutError('')
  }

  const addSelectedToCart = (event) => {
    event.preventDefault()
    if (!selectedItem) return
    const size = selectedItem.sizes.find((item) => item.label === selectedSize)
    const alreadyInCart = cart.find((line) => (
      line.id === selectedItem.id && line.size === selectedSize
    ))?.quantity || 0
    if (!size || alreadyInCart + selectedQuantity > size.stock) {
      setCheckoutError('Choose a valid size and quantity for the available stock.')
      return
    }
    if (
      adminSettings.maxItemsPerOrder > 0
      && totalQuantity + selectedQuantity > adminSettings.maxItemsPerOrder
    ) {
      const remaining = Math.max(0, adminSettings.maxItemsPerOrder - totalQuantity)
      const unit = remaining === 1 ? 'item' : 'items'
      setCheckoutError(`You can add ${remaining} more ${unit} to this order.`)
      return
    }

    setCart((current) => {
      const existing = current.find((line) => line.id === selectedItem.id && line.size === selectedSize)
      if (existing) {
        return current.map((line) => (
          line.id === selectedItem.id && line.size === selectedSize
            ? { ...line, quantity: line.quantity + selectedQuantity }
            : line
        ))
      }
      return [...current, {
        id: selectedItem.id,
        sizeId: size.id,
        name: selectedItem.name,
        course: selectedItem.course,
        size: selectedSize,
        price: selectedItem.price,
        stock: size.stock,
        quantity: selectedQuantity,
      }]
    })
    onNotify(`${selectedItem.name} (${selectedSize}) added to your bag.`)
    setSelectedItem(null)
  }

  const changeCartQuantity = (line, amount) => {
    const nextQuantity = line.quantity + amount
    if (amount > 0 && line.quantity >= line.stock) {
      onNotify(`Only ${line.stock} ${line.size} unit${line.stock === 1 ? '' : 's'} available.`)
      return
    }
    if (amount > 0 && adminSettings.maxItemsPerOrder > 0 && totalQuantity >= adminSettings.maxItemsPerOrder) {
      const unit = adminSettings.maxItemsPerOrder === 1 ? 'item' : 'items'
      onNotify(`Orders are limited to ${adminSettings.maxItemsPerOrder} ${unit}.`)
      return
    }
    setCart((current) => (
      nextQuantity < 1
        ? current.filter((item) => item.id !== line.id || item.size !== line.size)
        : current.map((item) => (
          item.id === line.id && item.size === line.size
            ? { ...item, quantity: nextQuantity }
            : item
        ))
    ))
  }

  const placeOrder = async (event) => {
    event.preventDefault()
    if (adminSettings.terms && !termsAccepted) {
      setCheckoutError('Please accept the checkout terms to continue.')
      return
    }
    if (!selectedPaymentMethod) {
      setCheckoutError('Choose an available payment method.')
      return
    }
    setOrderSubmitting(true)
    try {
      const created = await onCreateOrder(cart, total, selectedPaymentMethod)
      if (!created) return
      setCart([])
      setCheckoutOpen(false)
      setTermsAccepted(false)
      setCheckoutError('')
    } finally {
      setOrderSubmitting(false)
    }
  }

  return (
    <div className="catalog-page catalog-page--compact">
      {adminSettings.announcement && (
        <div className="catalog-announcement" role="status">
          <Icon name="bell" size={18} />
          <span>{adminSettings.announcement}</span>
        </div>
      )}
      {!orderingAvailable && (
        <div className="catalog-order-status" role="status">
          {deadlinePassed
            ? 'The order deadline has passed. New orders are closed.'
            : !adminSettings.paymentMethods.length
              ? 'Checkout is unavailable because no payment methods are enabled.'
              : 'Ordering is currently paused by the campus administrator.'}
        </div>
      )}
      <div className="catalog-search catalog-search--large">
        <Icon name="search" size={19} />
        <input
          type="search"
          aria-label="Search uniforms"
          placeholder="SEARCH"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        {search && (
          <button
            type="button"
            className="catalog-search__clear"
            aria-label="Clear search"
            onClick={() => setSearch('')}
          >
            ×
          </button>
        )}
      </div>

      <div className="catalog-course-filters" role="group" aria-label="Filter by course">
        {filterCourses.map((course) => (
          <button
            key={course}
            type="button"
            className={`catalog-course-filter${selectedCourse === course ? ' catalog-course-filter--active' : ''}`}
            aria-pressed={selectedCourse === course}
            onClick={() => setSelectedCourse(course)}
          >
            {courseAbbreviations[course]}
          </button>
        ))}
        <button
          type="button"
          className={`catalog-course-filter${selectedCourse === 'all' ? ' catalog-course-filter--active' : ''}`}
          aria-pressed={selectedCourse === 'all'}
          onClick={() => setSelectedCourse('all')}
        >
          All
        </button>
        <span className="sr-only" aria-live="polite">
          {filteredItems.length} uniform items shown
        </span>
      </div>

      {filteredItems.length ? (
        <div className="catalog-item-grid">
          {filteredItems.map((item) => (
            <article className="catalog-item-card" key={item.id}>
              <div className="catalog-item-card__details">
                <div className="catalog-item-card__course">{item.course}</div>
                <h2>{item.name}</h2>
                <div className="catalog-item-card__sizes" aria-label="Available sizes and quantities">
                  {item.sizes.map((size) => (
                    <span
                      className={`catalog-size${size.stock <= 5 ? ' catalog-size--limited' : ''}`}
                      key={size.label}
                    >
                      {size.label}:{size.stock}
                    </span>
                  ))}
                </div>
              </div>
              <button
                type="button"
                className="catalog-item-card__order"
                onClick={() => addToCart(item)}
                disabled={item.stock === 0 || !orderingAvailable}
                aria-label={`Order ${item.name}`}
              >
                ORDER
              </button>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state catalog-item-empty">
          <strong>No matching uniforms</strong>
          <span>Try a different course or search term.</span>
          <button
            type="button"
            className="text-button"
            onClick={() => {
              setSearch('')
              setSelectedCourse('all')
            }}
          >
            Show all uniforms
          </button>
        </div>
      )}

      {cart.length > 0 && (
        <aside className="cart-summary" aria-label="Shopping bag">
          <div className="cart-summary__icon">
            <Icon name="bag" size={20} />
            <span>{totalQuantity}</span>
          </div>
          <div className="cart-summary__copy">
            <strong>Your bag is ready</strong>
            <span>
              {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'} · {formatPhp(total)}
            </span>
          </div>
          <Button
            disabled={!orderingAvailable}
            onClick={() => {
              setCheckoutError('')
              setTermsAccepted(false)
              setCheckoutOpen(true)
            }}
          >
            Checkout <Icon name="arrow" size={16} />
          </Button>
        </aside>
      )}
      {selectedItem && (
        <div
          className="product-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedItem(null)
          }}
        >
          <section
            className="product-modal catalog-size-picker"
            role="dialog"
            aria-modal="true"
            aria-labelledby="size-picker-title"
          >
            <div className="product-modal__header">
              <div>
                <span>{selectedItem.course}</span>
                <h2 id="size-picker-title">{selectedItem.name}</h2>
                <p>{formatPhp(selectedItem.price)} per item</p>
              </div>
              <button
                type="button"
                className="icon-button"
                aria-label="Close size selector"
                onClick={() => setSelectedItem(null)}
              >
                ×
              </button>
            </div>
            <form className="product-form" onSubmit={addSelectedToCart}>
              <label>
                Size
                <select
                  value={selectedSize}
                  onChange={(event) => {
                    setSelectedSize(event.target.value)
                    setSelectedQuantity(1)
                    setCheckoutError('')
                  }}
                >
                  {selectedItem.sizes.map((size) => (
                    <option
                      key={size.label}
                      value={size.label}
                      disabled={size.stock <= (cart.find((line) => (
                        line.id === selectedItem.id && line.size === size.label
                      ))?.quantity || 0)}
                    >
                      {size.label}{size.stock === 0 ? ' - Out of stock' : ` - ${size.stock} available`}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Quantity
                <input
                  type="number"
                  min="1"
                  max={Math.max(
                    0,
                    (selectedItem.sizes.find((size) => size.label === selectedSize)?.stock || 0)
                    - (cart.find((line) => (
                      line.id === selectedItem.id && line.size === selectedSize
                    ))?.quantity || 0)
                  )}
                  step="1"
                  required
                  value={selectedQuantity}
                  onChange={(event) => {
                    const stock = Math.max(
                      0,
                      (selectedItem.sizes.find((size) => size.label === selectedSize)?.stock || 0)
                      - (cart.find((line) => (
                        line.id === selectedItem.id && line.size === selectedSize
                      ))?.quantity || 0)
                    )
                    const quantity = Number(event.target.value)
                    setSelectedQuantity(Math.max(1, Math.min(stock, quantity || 1)))
                    setCheckoutError('')
                  }}
                />
                <small>
                  {selectedItem.sizes.find((size) => size.label === selectedSize)?.stock || 0} available in this size
                </small>
              </label>
              {checkoutError && <p className="product-form__error" role="alert">{checkoutError}</p>}
              <div className="product-form__actions">
                <Button type="button" variant="outline" onClick={() => setSelectedItem(null)}>Cancel</Button>
                <Button type="submit"><Icon name="bag" size={16} /> Add to bag</Button>
              </div>
            </form>
          </section>
        </div>
      )}
      {checkoutOpen && (
        <div
          className="product-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setCheckoutOpen(false)
          }}
        >
          <section
            className="product-modal catalog-checkout"
            role="dialog"
            aria-modal="true"
            aria-labelledby="checkout-title"
          >
            <div className="product-modal__header">
              <div>
                <span>ORDER CHECKOUT</span>
                <h2 id="checkout-title">Review your order</h2>
                <p>{totalQuantity} {totalQuantity === 1 ? 'item' : 'items'} · {formatPhp(total)}</p>
              </div>
              <button type="button" className="icon-button" aria-label="Close checkout" onClick={() => setCheckoutOpen(false)}>×</button>
            </div>
            <form className="product-form" onSubmit={placeOrder}>
              <div className="checkout-cart" aria-label="Items in your order">
                {cart.map((line) => (
                  <div className="checkout-cart__line" key={`${line.id}-${line.size}`}>
                    <div className="checkout-cart__details">
                      <strong>{line.name}</strong>
                      <span>{line.course} · Size {line.size} · {formatPhp(line.price)} each</span>
                    </div>
                    <div className="checkout-cart__controls">
                      <div className="quantity-control">
                        <button
                          type="button"
                          aria-label={`Decrease ${line.name} size ${line.size} quantity`}
                          onClick={() => changeCartQuantity(line, -1)}
                        >
                          −
                        </button>
                        <span>{line.quantity}</span>
                        <button
                          type="button"
                          aria-label={`Increase ${line.name} size ${line.size} quantity`}
                          disabled={line.quantity >= line.stock}
                          onClick={() => changeCartQuantity(line, 1)}
                        >
                          +
                        </button>
                      </div>
                      <strong>{formatPhp(line.price * line.quantity)}</strong>
                    </div>
                  </div>
                ))}
                <div className="checkout-cart__total">
                  <span>Total ({totalQuantity} {totalQuantity === 1 ? 'item' : 'items'})</span>
                  <strong>{formatPhp(total)}</strong>
                </div>
              </div>
              <fieldset className="catalog-checkout__payments">
                <legend>Payment method</legend>
                {adminSettings.paymentMethods.map((method) => (
                  <label key={method}>
                    <input
                      type="radio"
                      name="payment-method"
                      value={method}
                      checked={selectedPaymentMethod === method}
                      onChange={() => setPaymentMethod(method)}
                    />
                    <span>{method}</span>
                  </label>
                ))}
              </fieldset>
              {adminSettings.paymentInstructions && (
                <p className="catalog-checkout__instructions">{adminSettings.paymentInstructions}</p>
              )}
              {adminSettings.terms && (
                <label className="catalog-checkout__terms">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(event) => {
                      setTermsAccepted(event.target.checked)
                      setCheckoutError('')
                    }}
                  />
                  <span>I have read and agree to these terms:</span>
                  <small>{adminSettings.terms}</small>
                </label>
              )}
              {checkoutError && <p className="product-form__error" role="alert">{checkoutError}</p>}
              <div className="product-form__actions">
                <Button type="button" variant="outline" onClick={() => setCheckoutOpen(false)}>Back to catalog</Button>
                <Button type="submit" disabled={orderSubmitting || !paymentMethod || !adminSettings.paymentMethods.length}>
                  {orderSubmitting ? 'Placing order…' : 'Place order'} <Icon name="arrow" size={16} />
                </Button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}
