import React, { useMemo, useState } from 'react'
import { Icon, PageIntro } from './Shared'

const courses = [
  'BS Nursing',
  'BS Medical Laboratory Sciences',
  'BS Psychology',
  'BS Radiologic Technology',
  'BS Accountancy',
  'BS Business Administration – Financial Management',
  'BS Business Administration – Marketing Management',
  'BS Hospitality Management',
  'BS Tourism Management',
  'Bachelor of Elementary Education',
  'Bachelor of Secondary Education – Filipino',
  'Bachelor of Secondary Education – English',
  'BS Criminology',
  'BS Information Technology',
]

const categories = ['All programs', 'BS programs', 'Education']

function courseCategory(course) {
  return course.startsWith('BS ') ? 'BS programs' : 'Education'
}

export default function StudentCatalog({ onNotify }) {
  const [category, setCategory] = useState('All programs')
  const [search, setSearch] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('')

  const filteredCourses = useMemo(() => {
    const query = search.trim().toLowerCase()
    return courses.filter((course) => {
      const matchesCategory = category === 'All programs' || courseCategory(course) === category
      return matchesCategory && course.toLowerCase().includes(query)
    })
  }, [category, search])

  const toggleCourse = (course) => {
    const nextCourse = selectedCourse === course ? '' : course
    setSelectedCourse(nextCourse)
    onNotify(nextCourse ? `${course} selected.` : `${course} selection cleared.`)
  }

  return (
    <div className="catalog-page">
      <section className="term-banner">
        <div className="term-banner__copy">
          <span className="banner-label">UNDERGRADUATE PROGRAMS</span>
          <h2>
            Find the path<br />that fits you.
          </h2>
          <p>Explore the available programs and select the one you are interested in.</p>
          <a
            href="#catalog-items"
            onClick={(event) => {
              event.preventDefault()
              document.getElementById('catalog-items')?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            Browse programs <Icon name="arrow" size={16} />
          </a>
        </div>
        <div className="term-banner__art" aria-hidden="true">
          <div className="program-highlight">
            <span>AVAILABLE PROGRAMS</span>
            <strong>{courses.length}</strong>
            <i>Find your next step</i>
          </div>
        </div>
      </section>

      <div className="catalog-meta">
        <div>
          <span className="online-dot" /> Program selection open <span className="meta-divider">·</span> Explore your options
        </div>
        <div className="catalog-meta__right">
          Available programs <strong>{courses.length}</strong>
        </div>
      </div>

      <div className="catalog-section" id="catalog-items">
        <PageIntro
          eyebrow="PROGRAM CATALOG"
          title="Explore programs"
          subtitle="Search and choose from the available degree programs."
          action={
            <div className="catalog-search">
              <Icon name="search" size={17} />
              <input
                type="search"
                aria-label="Search programs"
                placeholder="Search programs"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              {search && (
                <button
                  type="button"
                  className="catalog-search__clear"
                  aria-label="Clear program search"
                  onClick={() => setSearch('')}
                >
                  ×
                </button>
              )}
            </div>
          }
        />
        <div className="catalog-toolbar">
          <div className="category-tabs" role="tablist" aria-label="Program categories">
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
          <div className="items-count" aria-live="polite">
            {filteredCourses.length} {filteredCourses.length === 1 ? 'program' : 'programs'}
          </div>
        </div>

        {selectedCourse && (
          <div className="selected-course" role="status">
            <span>
              <strong>Selected program</strong>
              <span>{selectedCourse}</span>
            </span>
            <button type="button" onClick={() => toggleCourse(selectedCourse)}>
              Clear selection
            </button>
          </div>
        )}

        {filteredCourses.length ? (
          <div className="course-grid">
            {filteredCourses.map((course, index) => {
              const selected = selectedCourse === course
              return (
                <article className={`course-card${selected ? ' course-card--selected' : ''}`} key={course}>
                  <div className="course-card__top">
                    <span className="course-card__number">{String(index + 1).padStart(2, '0')}</span>
                    <span className="course-card__category">{courseCategory(course)}</span>
                  </div>
                  <h3>{course}</h3>
                  <button
                    type="button"
                    className="course-card__button"
                    aria-pressed={selected}
                    onClick={() => toggleCourse(course)}
                  >
                    {selected ? 'Selected' : 'Select program'}
                    <span aria-hidden="true">{selected ? '✓' : '→'}</span>
                  </button>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="empty-state">
            <strong>No matching programs</strong>
            <span>Try another search or choose a different category.</span>
            <button
              type="button"
              className="text-button"
              onClick={() => {
                setSearch('')
                setCategory('All programs')
              }}
            >
              Show all programs
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
