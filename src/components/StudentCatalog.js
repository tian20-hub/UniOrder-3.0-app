import React, { useMemo, useState } from 'react'
import { Button, Icon } from './Shared'
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

export default function StudentCatalog({ onCreateOrder, onNotify }) {
  const [selectedCourse, setSelectedCourse] = useState('all')
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState([])
  const catalogItems = useMemo(getCatalogItems, [])

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase()
    return catalogItems.filter((item) => {
      const matchesCourse = selectedCourse === 'all' || item.course === selectedCourse
      const matchesSearch = [item.course, item.courseLabel, item.name]
        .some((value) => value.toLowerCase().includes(query))
      return matchesCourse && matchesSearch
    })
  }, [catalogItems, search, selectedCourse])

  const total = cart.reduce((sum, item) => sum + item.price, 0)

  const addToCart = (item) => {
    setCart((current) => [...current, { name: item.name, price: item.price }])
    onNotify(`${item.name} added to your bag.`)
  }

  return (
    <div className="catalog-page catalog-page--compact">
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
                disabled={item.stock === 0}
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
            <span>{cart.length}</span>
          </div>
          <div className="cart-summary__copy">
            <strong>Your bag is ready</strong>
            <span>
              {cart.length} {cart.length === 1 ? 'item' : 'items'} · {formatPhp(total)}
            </span>
          </div>
          <Button
            onClick={() => {
              onCreateOrder(
                cart.map((item) => item.name),
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
