import React, { useMemo, useState } from 'react'
import { Badge, Button, Icon, PageIntro, StatCard } from './Shared'
import { formatEtbAsPhp } from '../utils/currency'

const initialItems = [
  { id: 'UNI-001', name: 'Classic School Polo Shirt', category: 'Tops', color: 'Sky blue', stock: 24, minimum: 12, price: 420 },
  { id: 'UNI-002', name: 'Everyday uniform trousers', category: 'Bottoms', color: 'Deep navy', stock: 8, minimum: 10, price: 680 },
  { id: 'UNI-003', name: 'Academy Cardigan', category: 'Layers', color: 'Academy navy', stock: 12, minimum: 8, price: 950 },
  { id: 'UNI-004', name: 'Pleated uniform skirt', category: 'Bottoms', color: 'Slate', stock: 5, minimum: 8, price: 610 },
  { id: 'UNI-005', name: 'Long-Sleeve Oxford Shirt', category: 'Tops', color: 'Cloud white', stock: 31, minimum: 12, price: 520 },
  { id: 'UNI-006', name: 'House Sports T-Shirt', category: 'Sportswear', color: 'Forest green', stock: 16, minimum: 8, price: 360 },
]

export default function Inventory({ onNotify }) {
  const [items, setItems] = useState(initialItems)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All stock')

  const lowStock = items.filter((item) => item.stock <= item.minimum).length
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchFilter = filter === 'All stock' || (filter === 'Low stock' && item.stock <= item.minimum)
      const matchQuery = `${item.name} ${item.id} ${item.category}`.toLowerCase().includes(query.toLowerCase())
      return matchFilter && matchQuery
    })
  }, [items, filter, query])

  const adjustStock = (id, amount) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, stock: Math.max(0, item.stock + amount) } : item
      )
    )
  }

  return (
    <div className="page-stack">
      <div className="stats-grid">
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
            <Button onClick={() => onNotify('Add product modal opened.')}>
              <Icon name="plus" size={17} /> Add product
            </Button>
          }
        />
        <div className="table-toolbar">
          <div className="table-tabs">
            {['All stock', 'Low stock'].map((item) => (
              <button
                key={item}
                type="button"
                className={filter === item ? 'table-tab table-tab--active' : 'table-tab'}
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
        </div>
        <div className="table-wrap">
          <table className="data-table inventory-table">
            <thead>
              <tr>
                <th>PRODUCT</th>
                <th>CATEGORY</th>
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
                  <td colSpan="6" className="table-empty">
                    No products match this view.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
