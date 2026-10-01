import React, { useMemo, useState } from 'react'
import { Badge, Button, Icon, PageIntro, ProductArtwork } from './Shared'

const products = [
  { id: 1, name: 'Classic polo shirt', category: 'Tops', colorName: 'Sky blue', color: '#78a8ca', price: 420, stock: 24, sizes: 'XS – XXL' },
  { id: 2, name: 'Everyday uniform trousers', category: 'Bottoms', colorName: 'Deep navy', color: '#263c62', price: 680, stock: 18, sizes: '26 – 36' },
  { id: 3, name: 'Campus cardigan', category: 'Layers', colorName: 'Academy navy', color: '#253958', price: 950, stock: 12, sizes: 'XS – XXL' },
  { id: 4, name: 'Pleated uniform skirt', category: 'Bottoms', colorName: 'Slate', color: '#52627b', price: 610, stock: 9, sizes: '24 – 34', artwork: 'trousers' },
  { id: 5, name: 'Long sleeve oxford', category: 'Tops', colorName: 'Cloud white', color: '#e8e9e7', price: 520, stock: 31, sizes: 'XS – XXL' },
  { id: 6, name: 'House sports tee', category: 'Sportswear', colorName: 'Forest green', color: '#628170', price: 360, stock: 16, sizes: 'XS – XXL' },
]

const categories = ['All items', 'Tops', 'Bottoms', 'Layers', 'Sportswear']

export default function StudentCatalog({ onCreateOrder, onNotify }) {
  const [category, setCategory] = useState('All items')
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState([])

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = category === 'All items' || product.category === category
      const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [category, search])

  const total = cart.reduce((sum, item) => sum + item.price, 0)

  const addToCart = (product) => {
    setCart((current) => [...current, product])
    onNotify(`${product.name} added to your bag.`)
  }

  return (
    <div className="catalog-page">
      <section className="term-banner">
        <div className="term-banner__copy">
          <span className="banner-label">NEW TERM · 2026/27</span>
          <h2>
            Ready for the<br />year ahead?
          </h2>
          <p>Everything you need for a confident start, picked for Blue Nile Academy.</p>
          <a
            href="#catalog-items"
            onClick={(event) => {
              event.preventDefault()
              document.getElementById('catalog-items')?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            Shop the collection <Icon name="arrow" size={16} />
          </a>
        </div>
        <div className="term-banner__art">
          <span className="banner-sun" />
          <div className="banner-shirt banner-shirt--back" />
          <div className="banner-shirt banner-shirt--front">
            <span />
          </div>
          <div className="banner-sticker">
            BACK<br />TO<br />SCHOOL
          </div>
          <div className="banner-caption">
            <span>01 / 03</span>
            <i />
          </div>
        </div>
      </section>

      <div className="catalog-meta">
        <div>
          <span className="online-dot" /> Orders open for Term 1 <span className="meta-divider">·</span> Pickup at the campus shop
        </div>
        <div className="catalog-meta__right">
          Student offer <strong>Save 10% on bundles</strong>
        </div>
      </div>

      <div className="catalog-section" id="catalog-items">
        <PageIntro
          eyebrow="THE ESSENTIALS"
          title="Find your fit"
          subtitle="School-approved favorites, ready when you are."
          action={
            <div className="catalog-search">
              <Icon name="search" size={17} />
              <input
                aria-label="Search items"
                placeholder="Search items"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          }
        />
        <div className="catalog-toolbar">
          <div className="category-tabs" role="tablist" aria-label="Product categories">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={category === item}
                className={category === item ? 'category-tab category-tab--active' : 'category-tab'}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="items-count">{filteredProducts.length} items</div>
        </div>

        {filteredProducts.length ? (
          <div className="product-grid">
            {filteredProducts.map((product, index) => (
              <article className="product-card" key={product.id}>
                <div className={`product-card__visual product-card__visual--${product.id}`}>
                  {index === 0 && <span className="product-tag">BESTSELLER</span>}
                  <div className="product-card__heart" aria-hidden="true">
                    ♡
                  </div>
                  <ProductArtwork color={product.color} tone={product.artwork} />
                </div>
                <div className="product-card__details">
                  <div className="product-card__category">
                    {product.category} <span>·</span> {product.colorName}
                  </div>
                  <h3>{product.name}</h3>
                  <div className="product-card__sizes">Sizes {product.sizes}</div>
                  <div className="product-card__footer">
                    <div className="product-price">
                      <strong>
                        {product.price.toLocaleString()} <small>ETB</small>
                      </strong>
                      <span>{product.stock} in stock</span>
                    </div>
                    <button
                      type="button"
                      className="add-to-bag"
                      onClick={() => addToCart(product)}
                      aria-label={`Add ${product.name} to bag`}
                    >
                      <Icon name="plus" size={19} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <strong>No matching items</strong>
            <span>Try another search or choose a different category.</span>
          </div>
        )}
      </div>

      {cart.length > 0 && (
        <aside className="cart-summary" aria-label="Shopping bag">
          <div className="cart-summary__icon">
            <Icon name="bag" size={20} />
            <span>{cart.length}</span>
          </div>
          <div className="cart-summary__copy">
            <strong>Your bag is ready</strong>
            <span>
              {cart.length} {cart.length === 1 ? 'item' : 'items'} · {total.toLocaleString()} ETB
            </span>
          </div>
          <Button
            onClick={() => {
              onCreateOrder(
                cart.map((c) => c.name),
                total
              )
              setCart([])
            }}
          >
            Place order <Icon name="arrow" size={16} />
          </Button>
        </aside>
      )}
    </div>
  )
}

