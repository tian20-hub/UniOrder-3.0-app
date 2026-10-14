import { useMemo, useState } from 'react'
import { Badge, Button, Icon, PageIntro, StatCard } from './Shared'
import { courses } from '../data/courses'
import { formatEtbAsPhp } from '../utils/currency'

const productCategories = ['Uniforms', 'Tops', 'Bottoms', 'Layers', 'Sportswear']
const emptyProduct = {
  id: '',
  name: '',
  category: 'Uniforms',
  course: 'All courses',
  color: '',
  priceEtb: '',
  sizesText: 'XS:5:1, S:8:2, M:12:3, L:6:2, XL:3:1',
}

function parseSizes(value) {
  const rows = value.split(',').map((part) => part.trim()).filter(Boolean)
  if (!rows.length) return null
  const sizes = []
  for (const row of rows) {
    const match = row.match(/^([a-z0-9 -]{1,20})\s*:\s*(\d+)\s*:\s*(\d+)$/i)
    if (!match) return null
    const label = match[1].trim()
    if (sizes.some((size) => size.label.toLowerCase() === label.toLowerCase())) return null
    sizes.push({ label, stock: Number(match[2]), minimum: Number(match[3]) })
  }
  return sizes
}

export default function Inventory({
  inventory: products,
  onSaveProduct,
  onAdjustStock,
}) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All stock')
  const [courseFilter, setCourseFilter] = useState('All courses')
  const [productFormOpen, setProductFormOpen] = useState(false)
  const [product, setProduct] = useState(emptyProduct)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const lowStock = products.filter((item) => (
    item.sizes.some((size) => size.stock <= size.minimum)
  )).length
  const inventoryUnits = products.reduce(
    (total, item) => total + item.sizes.reduce((sum, size) => sum + size.stock, 0),
    0
  )
  const inventoryValue = products.reduce(
    (total, item) => total + item.sizes.reduce((sum, size) => sum + size.stock, 0) * item.priceEtb,
    0
  )
  const filteredProducts = useMemo(() => products.filter((item) => {
    const hasLowStock = item.sizes.some((size) => size.stock <= size.minimum)
    const matchesFilter = filter === 'All stock' || hasLowStock
    const matchesCourse = courseFilter === 'All courses'
      || item.course === 'All courses'
      || item.course === courseFilter
    const matchesQuery = `${item.name} ${item.category} ${item.course} ${item.color}`
      .toLowerCase()
      .includes(query.trim().toLowerCase())
    return matchesFilter && matchesCourse && matchesQuery
  }), [products, filter, courseFilter, query])

  const openProductForm = (item = null) => {
    setProduct(item ? {
      id: item.id,
      name: item.name,
      category: item.category,
      course: item.course,
      color: item.color,
      priceEtb: String(item.priceEtb),
      sizesText: item.sizes.map((size) => `${size.label}:${size.stock}:${size.minimum}`).join(', '),
    } : emptyProduct)
    setFormError('')
    setProductFormOpen(true)
  }

  const saveProduct = async (event) => {
    event.preventDefault()
    const sizes = parseSizes(product.sizesText)
    const priceEtb = Number(product.priceEtb)
    if (!product.name.trim() || !product.color.trim() || !Number.isFinite(priceEtb) || priceEtb <= 0 || !sizes) {
      setFormError('Enter a product name, color, valid price, and sizes as label:stock:minimum.')
      return
    }

    setSaving(true)
    try {
      const saved = await onSaveProduct({
        ...product,
        name: product.name.trim(),
        color: product.color.trim(),
        priceEtb,
        sizes,
      })
      if (saved) {
        setProductFormOpen(false)
        setProduct(emptyProduct)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-stack">
      <div className="stats-grid inventory-stats">
        <StatCard label="Catalog products" value={products.length} change="Shared with student catalog" icon="package" tone="blue" />
        <StatCard label="Units in stock" value={inventoryUnits} change="Across all sizes" icon="grid" tone="green" />
        <StatCard label="Low-stock alerts" value={lowStock} change="Restock recommended" icon="bell" tone="amber" />
        <StatCard label="Inventory value" value={formatEtbAsPhp(inventoryValue)} change="At listed price" icon="chart" tone="purple" />
      </div>

      <section className="surface inventory-surface">
        <PageIntro
          eyebrow="STOCKROOM"
          title="Product inventory"
          subtitle="Size-level stock is shared directly with the student catalog."
          action={
            <Button onClick={() => openProductForm()}>
              <Icon name="plus" size={17} /> Add uniform
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
              placeholder="Search uniforms..."
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
                <th>UNIFORM</th>
                <th>COURSE</th>
                <th>UNIT PRICE</th>
                <th>SIZE STOCK</th>
                <th>ADJUST STOCK</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="inventory-product">
                      <div className="inventory-product__swatch inventory-product__swatch--uniforms">
                        <Icon name="package" size={17} />
                      </div>
                      <span><strong>{item.name}</strong><small>{item.category} · {item.color}</small></span>
                    </div>
                  </td>
                  <td>{item.course}</td>
                  <td><strong>{formatEtbAsPhp(item.priceEtb)}</strong></td>
                  <td>
                    <div className="inventory-size-list">
                      {item.sizes.map((size) => (
                        <Badge key={size.id} tone={size.stock <= size.minimum ? 'amber' : 'green'}>
                          {size.label}: {size.stock}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className="inventory-size-controls">
                      {item.sizes.map((size) => (
                        <div className="inventory-size-control" key={size.id}>
                          <span>{size.label}</span>
                          <button
                            type="button"
                            disabled={size.stock === 0}
                            aria-label={`Decrease ${item.name} size ${size.label} stock`}
                            onClick={() => onAdjustStock(size, -1)}
                          >−</button>
                          <strong>{size.stock}</strong>
                          <button
                            type="button"
                            aria-label={`Increase ${item.name} size ${size.label} stock`}
                            onClick={() => onAdjustStock(size, 1)}
                          >+</button>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td>
                    <button type="button" className="member-action" onClick={() => openProductForm(item)}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
              {!filteredProducts.length && (
                <tr><td colSpan="6" className="table-empty">No uniforms match this view.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {productFormOpen && (
        <div
          className="product-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setProductFormOpen(false)
          }}
        >
          <section className="product-modal" role="dialog" aria-modal="true" aria-labelledby="product-form-title">
            <div className="product-modal__header">
              <div>
                <span>CATALOG & STOCKROOM</span>
                <h2 id="product-form-title">{product.id ? 'Edit uniform' : 'Add a uniform'}</h2>
                <p>Changes update both the student catalog and size-level stock.</p>
              </div>
              <button type="button" className="icon-button" onClick={() => setProductFormOpen(false)} aria-label="Close product form">×</button>
            </div>
            <form className="product-form" onSubmit={saveProduct}>
              <label>
                Product name
                <input required maxLength={80} value={product.name} onChange={(event) => setProduct({ ...product, name: event.target.value })} />
              </label>
              <div className="product-form__row">
                <label>
                  Category
                  <select value={product.category} onChange={(event) => setProduct({ ...product, category: event.target.value })}>
                    {productCategories.map((category) => <option key={category}>{category}</option>)}
                  </select>
                </label>
                <label>
                  Course
                  <select value={product.course} onChange={(event) => setProduct({ ...product, course: event.target.value })}>
                    <option>All courses</option>
                    {courses.map((course) => <option key={course}>{course}</option>)}
                  </select>
                </label>
              </div>
              <div className="product-form__row">
                <label>
                  Color
                  <input required maxLength={40} value={product.color} onChange={(event) => setProduct({ ...product, color: event.target.value })} />
                </label>
                <label>
                  Unit price (ETB)
                  <input type="number" required min="0.01" step="0.01" value={product.priceEtb} onChange={(event) => setProduct({ ...product, priceEtb: event.target.value })} />
                </label>
              </div>
              <label>
                Sizes and stock (size:quantity:low-stock-alert, comma separated)
                <input
                  required
                  value={product.sizesText}
                  onChange={(event) => setProduct({ ...product, sizesText: event.target.value })}
                  placeholder="XS:5:1, S:8:2, M:12:3"
                />
                <small>Example: XS:5:1, S:8:2, Free Size:15:3</small>
              </label>
              {formError && <p className="product-form__error" role="alert">{formError}</p>}
              <div className="product-form__actions">
                <Button type="button" variant="outline" onClick={() => setProductFormOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={saving}>
                  <Icon name="check" size={16} /> {saving ? 'Saving…' : 'Save uniform'}
                </Button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}
