import React, { useEffect, useMemo, useState } from 'react'
import { Badge, Button, Icon, PageIntro, StatCard } from './Shared'
import { courses } from '../data/courses'
import { formatEtbAsPhp } from '../utils/currency'

const emptyProduct = {
  name: '',
  category: 'Tops',
  course: 'All courses',
  color: '',
  price: '',
  stock: '',
  minimum: '',
}
const productCategories = ['Tops', 'Bottoms', 'Layers', 'Sportswear']

function createProductId(items) {
  const lastNumber = items.reduce((maximum, item) => {
    const number = Number(item.id.match(/\d+$/)?.[0] || 0)
    return Math.max(maximum, number)
  }, 0)
  return `UNI-${String(lastNumber + 1).padStart(3, '0')}`
}

export default function Inventory({ onNotify, inventory: items, onUpdateInventory: setItems }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All stock')
  const [courseFilter, setCourseFilter] = useState('All courses')
  const [addProductOpen, setAddProductOpen] = useState(false)
  const [product, setProduct] = useState(emptyProduct)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (!addProductOpen) return undefined
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setAddProductOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [addProductOpen])

  const lowStock = items.filter((item) => item.stock <= item.minimum).length
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchFilter = filter === 'All stock' || (filter === 'Low stock' && item.stock <= item.minimum)
      const matchCourse = courseFilter === 'All courses'
        || item.course === 'All courses'
        || item.course === courseFilter
      const matchQuery = `${item.name} ${item.id} ${item.category} ${item.course}`.toLowerCase().includes(query.toLowerCase())
      return matchFilter && matchCourse && matchQuery
    })
  }, [items, filter, courseFilter, query])

  const adjustStock = (id, amount) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, stock: Math.max(0, item.stock + amount) } : item
      )
    )
  }

  const addProduct = (event) => {
    event.preventDefault()
    const normalizedName = product.name.trim()
    if (items.some((item) => (
      item.name.toLowerCase() === normalizedName.toLowerCase()
      && item.course === product.course
    ))) {
      setFormError('A product with this name already exists for this course.')
      return
    }

    const newItem = {
      id: createProductId(items),
      name: normalizedName,
      category: product.category,
      course: product.course,
      color: product.color.trim(),
      price: Number(product.price),
      stock: Number(product.stock),
      minimum: Number(product.minimum),
    }
    setItems((current) => [...current, newItem])
    setProduct(emptyProduct)
    setFormError('')
    setAddProductOpen(false)
    onNotify(`${newItem.name} was added to inventory.`)
  }

  return (
    <div className="page-stack">
      <div className="stats-grid inventory-stats">
        <StatCard
          label="Total products"
          value={items.length}
          change="Across 4 categories"
          icon="package"
          tone="blue"
        />
        <StatCard
          label="Units in stock"
          value={items.reduce((sum, item) => sum + item.stock, 0)}
          change="Updated just now"
          icon="grid"
          tone="green"
        />
        <StatCard
          label="Low stock alerts"
          value={lowStock}
          change="Restock recommended"
          icon="bell"
          tone="amber"
        />
        <StatCard
          label="Inventory value"
          value={formatEtbAsPhp(items.reduce((sum, item) => sum + item.stock * item.price, 0))}
          change="At listed price"
          icon="chart"
          tone="purple"
        />
      </div>

      <section className="surface inventory-surface">
        <PageIntro
          eyebrow="STOCKROOM"
          title="Product inventory"
          subtitle="A real-time look at your campus shop stock."
          action={
            <Button onClick={() => setAddProductOpen(true)}>
              <Icon name="plus" size={17} /> Add product
            </Button>
          }
        />
        <div className="table-toolbar">
          <div className="table-tabs" role="group" aria-label="Filter inventory stock">
            {['All stock', 'Low stock'].map((item) => (
              <button
                key={item}
                type="button"
                className={filter === item ? 'table-tab table-tab--active' : 'table-tab'}
                aria-pressed={filter === item}
                onClick={() => setFilter(item)}
              >
                {item}
                {item === 'Low stock' && <span>{lowStock}</span>}
              </button>
            ))}
          </div>
          <label className="table-search">
            <Icon name="search" size={16} />
            <input
              aria-label="Search inventory"
              placeholder="Search products..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <label className="inventory-course-filter">
            <span>Course</span>
            <select
              aria-label="Filter inventory by course"
              value={courseFilter}
              onChange={(event) => setCourseFilter(event.target.value)}
            >
              <option>All courses</option>
              {courses.map((course) => <option key={course}>{course}</option>)}
            </select>
          </label>
        </div>
        <div className="table-wrap">
          <table className="data-table inventory-table">
            <thead>
              <tr>
                <th>PRODUCT</th>
                <th>CATEGORY</th>
                <th>COURSE</th>
                <th>COLOR</th>
                <th>UNIT PRICE</th>
                <th>STOCK LEVEL</th>
                <th>QUICK ADJUST</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const isLow = item.stock <= item.minimum
                const ratio = Math.min(100, Math.round((item.stock / Math.max(item.minimum * 2, 1)) * 100))
                return (
                  <tr key={item.id}>
                    <td>
                      <div className="inventory-product">
                        <div
                          className={`inventory-product__swatch inventory-product__swatch--${item.category.toLowerCase()}`}
                        >
                          <Icon name="package" size={17} />
                        </div>
                        <span>
                          <strong>{item.name}</strong>
                          <small>{item.id}</small>
                        </span>
                      </div>
                    </td>
                    <td>{item.category}</td>
                    <td>{item.course}</td>
                    <td>{item.color}</td>
                    <td>
                      <strong>{formatEtbAsPhp(item.price)}</strong>
                    </td>
                    <td>
                      <div className="stock-cell">
                        <div className="stock-cell__top">
                          <strong>{item.stock} units</strong>
                          <Badge tone={isLow ? 'amber' : 'green'}>
                            {isLow ? 'Low stock' : 'In stock'}
                          </Badge>
                        </div>
                        <div className="stock-bar">
                          <span
                            className={
                              isLow
                                ? 'stock-bar__fill stock-bar__fill--low'
                                : 'stock-bar__fill'
                            }
                            style={{ width: `${ratio}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="quantity-control">
                        <button
                          type="button"
                          onClick={() => adjustStock(item.id, -1)}
                          disabled={item.stock === 0}
                          aria-label={`Decrease ${item.name} stock`}
                        >
                          −
                        </button>
                        <span>{item.stock}</span>
                        <button
                          type="button"
                          onClick={() => adjustStock(item.id, 1)}
                          aria-label={`Increase ${item.name} stock`}
                        >
                          +
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {!filteredItems.length && (
                <tr>
                  <td colSpan="7" className="table-empty">
                    No products match this view.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      {addProductOpen && (
        <div
          className="product-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setAddProductOpen(false)
          }}
        >
          <section
            className="product-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-product-title"
          >
            <div className="product-modal__header">
              <div>
                <span>STOCKROOM</span>
                <h2 id="add-product-title">Add a product</h2>
                <p>Set the product details and starting stock level.</p>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setAddProductOpen(false)}
                aria-label="Close add product form"
              >
                ×
              </button>
            </div>
            <form className="product-form" onSubmit={addProduct}>
              <label>
                Product name
                <input
                  autoFocus
                  required
                  maxLength={80}
                  value={product.name}
                  onChange={(event) => {
                    setProduct({ ...product, name: event.target.value })
                    setFormError('')
                  }}
                  placeholder="e.g. School blazer"
                />
              </label>
              <div className="product-form__row">
                <label>
                  Category
                  <select
                    value={product.category}
                    onChange={(event) => setProduct({ ...product, category: event.target.value })}
                  >
                    {productCategories.map((category) => <option key={category}>{category}</option>)}
                  </select>
                </label>
                <label>
                  Course
                  <select
                    value={product.course}
                    onChange={(event) => setProduct({ ...product, course: event.target.value })}
                  >
                    <option>All courses</option>
                    {courses.map((course) => <option key={course}>{course}</option>)}
                  </select>
                </label>
              </div>
              <label>
                Color
                <input
                  required
                  maxLength={40}
                  value={product.color}
                  onChange={(event) => setProduct({ ...product, color: event.target.value })}
                  placeholder="e.g. Navy"
                />
              </label>
              <div className="product-form__row">
                <label>
                  Unit price (ETB)
                  <input
                    type="number"
                    required
                    min="0.01"
                    step="0.01"
                    value={product.price}
                    onChange={(event) => setProduct({ ...product, price: event.target.value })}
                    placeholder="0.00"
                  />
                </label>
                <label>
                  Starting stock
                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    value={product.stock}
                    onChange={(event) => setProduct({ ...product, stock: event.target.value })}
                    placeholder="0"
                  />
                </label>
              </div>
              <label>
                Low-stock alert at
                <input
                  type="number"
                  required
                  min="0"
                  step="1"
                  value={product.minimum}
                  onChange={(event) => setProduct({ ...product, minimum: event.target.value })}
                  placeholder="e.g. 8"
                />
              </label>
              {formError && <p className="product-form__error" role="alert">{formError}</p>}
              <div className="product-form__actions">
                <Button type="button" variant="outline" onClick={() => setAddProductOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Icon name="plus" size={16} /> Save product
                </Button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}
