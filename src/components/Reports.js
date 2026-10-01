import React, { useMemo, useState } from 'react'
import { Badge, Icon, PageIntro, StatCard } from './Shared'
import { formatEtbAsPhp, formatPhp } from '../utils/currency'

const monthly = [
  { label: 'May', orders: 42, revenue: 28 },
  { label: 'Jun', orders: 58, revenue: 45 },
  { label: 'Jul', orders: 46, revenue: 35 },
  { label: 'Aug', orders: 74, revenue: 68 },
  { label: 'Sep', orders: 89, revenue: 78 },
  { label: 'Oct', orders: 63, revenue: 54 },
]

const topProducts = [
  { name: 'Classic School Polo Shirt', category: 'Tops · Sky blue', sold: 248, revenue: 104160, percent: 92 },
  { name: 'Everyday uniform trousers', category: 'Bottoms · Deep navy', sold: 186, revenue: 126480, percent: 75 },
  { name: 'Long-Sleeve Oxford Shirt', category: 'Tops · Cloud white', sold: 142, revenue: 73840, percent: 58 },
  { name: 'Academy Cardigan', category: 'Layers · Academy navy', sold: 96, revenue: 91200, percent: 42 },
]

export default function Reports({ orders }) {
  const [period, setPeriod] = useState('This term')

  const average = orders.length
    ? Math.round(orders.reduce((sum, order) => sum + order.total, 0) / orders.length)
    : 0

  const chartData = useMemo(() => {
    if (period === 'This month') return monthly.slice(-3)
    if (period === 'Last 6 months') return monthly
    return monthly.slice(2)
  }, [period])

  return (
    <div className="page-stack">
      <div className="report-toolbar">
        <span>Reporting period</span>
        <label className="select-control">
          <select value={period} onChange={(event) => setPeriod(event.target.value)}>
            <option>This term</option>
            <option>This month</option>
            <option>Last 6 months</option>
          </select>
          <Icon name="chevron" size={15} />
        </label>
        <button type="button" className="outline-control" onClick={() => window.print()}>
          <Icon name="arrow" size={15} /> Export report
        </button>
      </div>

      <div className="stats-grid">
        <StatCard
          label="Total revenue"
          value={formatEtbAsPhp(482650)}
          change="+12.8% from last term"
          icon="chart"
          tone="green"
        />
        <StatCard
          label="Orders placed"
          value="1,284"
          change="+8.2% from last term"
          icon="bag"
          tone="blue"
        />
        <StatCard
          label="Average order"
          value={formatPhp(average)}
          change="Based on current orders"
          icon="receipt"
          tone="purple"
        />
        <StatCard
          label="Fulfillment rate"
          value="96.4%"
          change="+2.1% from last term"
          icon="check"
          tone="amber"
        />
      </div>

      <div className="report-grid">
        <section className="surface chart-surface">
          <PageIntro
            eyebrow="PERFORMANCE"
            title="Orders over time"
            subtitle="A steady start to the new school year."
            action={
              <div className="chart-legend">
                <span>
                  <i className="legend-dot legend-dot--orders" /> Orders
                </span>
                <span>
                  <i className="legend-dot legend-dot--revenue" /> Revenue
                </span>
              </div>
            }
          />
          <div className="chart" role="img" aria-label="Bar chart showing orders and revenue from May to October">
            <div className="chart__axis">
              <span>100</span>
              <span>75</span>
              <span>50</span>
              <span>25</span>
              <span>0</span>
            </div>
            <div className="chart__plot">
              {[100, 75, 50, 25].map((tick) => (
                <div key={tick} className="chart__gridline" style={{ bottom: `${tick}%` }} />
              ))}
              {chartData.map((month) => (
                <div className="chart__group" key={month.label}>
                  <div className="chart__bars">
                    <span
                      className="chart__bar chart__bar--orders"
                      style={{ height: `${month.orders}%` }}
                    />
                    <span
                      className="chart__bar chart__bar--revenue"
                      style={{ height: `${month.revenue}%` }}
                    />
                  </div>
                  <span className="chart__month">{month.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="chart-foot">
            <span>
              <Icon name="chart" size={15} /> Showing monthly trends
            </span>
            <Badge tone="green">On track</Badge>
          </div>
        </section>

        <section className="surface category-surface">
          <PageIntro
            eyebrow="BREAKDOWN"
            title="Orders by category"
            subtitle="What your campus is shopping."
          />
          <div className="donut-wrap">
            <div className="donut-chart">
              <div>
                <strong>1,284</strong>
                <span>Total orders</span>
              </div>
            </div>
            <div className="donut-legend">
              <div>
                <i className="donut-key donut-key--tops" />
                <span>Tops</span>
                <strong>42%</strong>
              </div>
              <div>
                <i className="donut-key donut-key--bottoms" />
                <span>Bottoms</span>
                <strong>28%</strong>
              </div>
              <div>
                <i className="donut-key donut-key--layers" />
                <span>Layers</span>
                <strong>18%</strong>
              </div>
              <div>
                <i className="donut-key donut-key--other" />
                <span>Other</span>
                <strong>12%</strong>
              </div>
            </div>
          </div>
          <div className="category-insight">
            <span>✦</span>
            <p>
              <strong>Tops are leading.</strong> Polo shirts are the most purchased item this term.
            </p>
          </div>
        </section>
      </div>

      <section className="surface top-products-surface">
        <PageIntro
          eyebrow="WHAT'S MOVING"
          title="Top performing products"
          subtitle="Your most popular pieces this term."
          action={
            <button type="button" className="view-all-button">
              View inventory <Icon name="arrow" size={15} />
            </button>
          }
        />
        <div className="top-products-list">
          {topProducts.map((product, index) => (
            <div className="top-product" key={product.name}>
              <span className={`top-product__rank top-product__rank--${index + 1}`}>
                0{index + 1}
              </span>
              <span className={`top-product__swatch top-product__swatch--${index + 1}`} />
              <span className="top-product__name">
                <strong>{product.name}</strong>
                <small>{product.category}</small>
              </span>
              <span className="top-product__sold">
                <strong>{product.sold}</strong>
                <small>units sold</small>
              </span>
              <span className="top-product__bar">
                <i style={{ width: `${product.percent}%` }} />
              </span>
              <span className="top-product__revenue">{formatEtbAsPhp(product.revenue)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
