import React, { useEffect, useMemo, useState } from 'react'
import { Button, Icon } from './Shared'
import { defaultAdminSettings } from '../data/adminSettings'
import { courses, getCourseUniformsForCourse } from '../data/courses'
import { convertEtbToPhp, formatPhp } from '../utils/currency'

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

const courseDisplayNames = {
  'BS Nursing': 'Nursing',
  'BS Medical Laboratory Sciences': 'Medical Laboratory Sciences',
  'BS Psychology': 'Psychology',
  'BS Radiologic Technology': 'Radiologic Technology',
  'BS Accountancy': 'Accountancy',
  'BS Business Administration – Financial Management': 'Business Administration – Financial Management',
  'BS Business Administration – Marketing Management': 'Business Administration – Marketing Management',
  'BS Hospitality Management': 'Hospitality Management',
  'BS Tourism Management': 'Tourism Management',
  'Bachelor of Elementary Education': 'Elementary Education',
  'Bachelor of Secondary Education – Filipino': 'Secondary Education – Filipino',
  'Bachelor of Secondary Education – English': 'Secondary Education – English',
  'BS Criminology': 'Criminology',
  'BS Information Technology': 'Information Technology',
}

const defaultSizes = [
  { label: 'XS', stock: 5 },
  { label: 'S', stock: 8 },
  { label: 'M', stock: 12 },
  { label: 'L', stock: 6 },
  { label: 'XL', stock: 3 },
]

const courseSpecificItems = {
  'BS Nursing': [
    {
      name: 'Nursing Uniform - Set A',
      priceMultiplier: 1,
      sizes: [
        { label: 'XS', stock: 5 },
        { label: 'S', stock: 8 },
        { label: 'M', stock: 12 },
        { label: 'L', stock: 6 },
        { label: 'XL', stock: 3 },
      ],
    },
    {
      name: 'Nursing Uniform - Set B (Clinical)',
      priceMultiplier: 1.12,
      sizes: [
        { label: 'S', stock: 4 },
        { label: 'M', stock: 7 },
        { label: 'L', stock: 5 },
        { label: 'XL', stock: 2 },
      ],
    },
    {
      name: 'Laboratory Gown',
      priceEtb: 620,
      sizes: [{ label: 'Free Size', stock: 15 }],
    },
  ],
  'BS Medical Laboratory Sciences': [
    {
      name: 'MedTech Uniform - Set A',
      priceMultiplier: 1,
      sizes: [
        { label: 'S', stock: 5 },
        { label: 'M', stock: 9 },
        { label: 'L', stock: 6 },
        { label: 'XL', stock: 3 },
      ],
    },
    {
      name: 'Laboratory Gown',
      priceEtb: 620,
      sizes: [
        { label: 'S', stock: 6 },
        { label: 'M', stock: 10 },
        { label: 'L', stock: 8 },
        { label: 'XL', stock: 4 },
      ],
    },
  ],
  'BS Psychology': [
    {
      name: 'Psychology Uniform - Set A',
      priceMultiplier: 1,
      sizes: [
        { label: 'XS', stock: 4 },
        { label: 'S', stock: 7 },
        { label: 'M', stock: 10 },
        { label: 'L', stock: 5 },
        { label: 'XL', stock: 2 },
      ],
    },
  ],
  'BS Radiologic Technology': [
    {
      name: 'RadTech Uniform - Set A',
      priceMultiplier: 1,
      sizes: [
        { label: 'S', stock: 3 },
        { label: 'M', stock: 6 },
        { label: 'L', stock: 4 },
        { label: 'XL', stock: 2 },
      ],
    },
    {
      name: 'Protective Apron',
      priceEtb: 480,
      sizes: [
        { label: 'M', stock: 5 },
        { label: 'L', stock: 5 },
        { label: 'XL', stock: 3 },
      ],
    },
  ],
}

const baseProductPricesEtb = {
  1: 420,
  2: 680,
  3: 950,
  4: 610,
  5: 520,
  6: 360,
}

function getCourseSetPrice(course) {
  return getCourseUniformsForCourse(course).reduce(
    (total, productId) => total + (baseProductPricesEtb[productId] || 0),
    0
  )
}

function getCatalogItems() {
  return courses.flatMap((course) => {
    const basePriceEtb = getCourseSetPrice(course)
    const definitions = courseSpecificItems[course] || [{
      name: `${courseDisplayNames[course]} Uniform - Set A`,
      priceMultiplier: 1,
      sizes: defaultSizes,
    }]

    return definitions.map((definition, index) => ({
      id: `${courseAbbreviations[course]}-${index}`,
      course,
      courseLabel: courseDisplayNames[course],
      name: definition.name,
      sizes: definition.sizes,
      stock: definition.sizes.reduce((total, size) => total + size.stock, 0),
      price: convertEtbToPhp(definition.priceEtb ?? basePriceEtb * (definition.priceMultiplier || 1)),
    }))
  })
}

export default function StudentCatalog({
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
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')
  const catalogItems = useMemo(getCatalogItems, [])
  const deadlinePassed = Boolean(
    adminSettings.orderDeadline
    && Date.now() > new Date(adminSettings.orderDeadline).getTime()
  )
  const orderingAvailable = adminSettings.orderingEnabled
    && !deadlinePassed
    && adminSettings.paymentMethods.length > 0

  useEffect(() => {
    if (!adminSettings.paymentMethods.includes(paymentMethod)) {
      setPaymentMethod(adminSettings.paymentMethods[0] || '')
    }
  }, [adminSettings.paymentMethods, paymentMethod])

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

  const placeOrder = (event) => {
    event.preventDefault()
    if (adminSettings.terms && !termsAccepted) {
      setCheckoutError('Please accept the checkout terms to continue.')
      return
    }
    if (!paymentMethod || !adminSettings.paymentMethods.includes(paymentMethod)) {
      setCheckoutError('Choose an available payment method.')
      return
    }
    const created = onCreateOrder(cart, total, paymentMethod)
    if (created === false) return
    setCart([])
    setCheckoutOpen(false)
    setTermsAccepted(false)
    setCheckoutError('')
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
                      checked={paymentMethod === method}
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
                <Button type="submit" disabled={!paymentMethod || !adminSettings.paymentMethods.length}>
                  Place order <Icon name="arrow" size={16} />
                </Button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}
