import { useMemo, useState } from 'react'
import { Icon, PageIntro, StatCard } from './Shared'
import { formatPhp } from '../utils/currency'

const statusGroups = [
  { label: 'Awaiting payment', color: '#f59e0b' },
  { label: 'Processing', color: '#8b5cf6' },
  { label: 'Ready for pickup', color: '#2563eb' },
  { label: 'Completed', color: '#10b981' },
]

const numberFormat = new Intl.NumberFormat('en')
const money = (amount) => formatPhp(amount)

function parseOrderDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(date) {
  return new Intl.DateTimeFormat('en', { month: 'short', year: '2-digit' }).format(date)
}

function monthStart(key) {
  const [year, month] = key.split('-').map(Number)
  return new Date(year, month - 1, 1)
}

function getDateRange(orders, period) {
  const datedOrders = orders
    .map((order) => ({ order, date: parseOrderDate(order.date) }))
    .filter((entry) => entry.date)
  if (!datedOrders.length || period === 'All time') return orders

  const latest = datedOrders.reduce(
    (latestDate, entry) => (entry.date > latestDate ? entry.date : latestDate),
    datedOrders[0].date
  )
  const latestMonth = monthKey(latest)
  if (period === 'This month') {
    return datedOrders
      .filter((entry) => monthKey(entry.date) === latestMonth)
      .map((entry) => entry.order)
  }

  const earliest = new Date(latest.getFullYear(), latest.getMonth() - 5, 1)
  return datedOrders
    .filter((entry) => entry.date >= earliest)
    .map((entry) => entry.order)
}

function makeMonthlySeries(orders, period) {
  const datedOrders = orders
    .map((order) => ({ order, date: parseOrderDate(order.date) }))
    .filter((entry) => entry.date)
  if (!datedOrders.length) return []

  const latest = datedOrders.reduce(
    (latestDate, entry) => (entry.date > latestDate ? entry.date : latestDate),
    datedOrders[0].date
  )
  const orderTotals = new Map()
  datedOrders.forEach(({ order, date }) => {
    const key = monthKey(date)
    const totals = orderTotals.get(key) || { orders: 0, sales: 0 }
    totals.orders += 1
    totals.sales += order.total
    orderTotals.set(key, totals)
  })

  const keys = period === 'This month'
    ? [monthKey(latest)]
    : period === 'Last 6 months'
      ? Array.from({ length: 6 }, (_, index) => {
        const date = new Date(latest.getFullYear(), latest.getMonth() - 5 + index, 1)
        return monthKey(date)
      })
      : Array.from(orderTotals.keys()).sort()

  return keys.map((key) => ({
    label: monthLabel(monthStart(key)),
    orders: orderTotals.get(key)?.orders || 0,
    sales: orderTotals.get(key)?.sales || 0,
  }))
}

function OrdersChart({ data, metric, chartType, onSelect, selectedIndex }) {
  if (!data.length) {
    return <div className="reports-chart__empty">No dated orders to chart for this period.</div>
  }

  const values = data.map((item) => item[metric])
  const maxValue = Math.max(...values, 1)
  const active = data[selectedIndex] || data[data.length - 1]
  const metricLabel = metric === 'sales' ? 'Sales' : 'Orders'

  return (
    <div className="reports-chart">
      <div className="reports-chart__scale" aria-hidden="true">
        <span>{metric === 'sales' ? money(maxValue) : numberFormat.format(maxValue)}</span>
        <span>{metric === 'sales' ? money(Math.round(maxValue / 2)) : numberFormat.format(Math.round(maxValue / 2))}</span>
        <span>0</span>
      </div>

      {chartType === 'bar' ? (
        <div className="reports-bars" role="group" aria-label={`${metricLabel} by month`}>
          {data.map((item, index) => {
            const percent = item[metric] ? Math.max((item[metric] / maxValue) * 100, 2) : 0
            return (
              <button
                key={item.label}
                type="button"
                className={`reports-bars__item${selectedIndex === index ? ' is-selected' : ''}`}
                aria-label={`${item.label}: ${metric === 'sales' ? money(item.sales) : `${item.orders} orders`}`}
                aria-pressed={selectedIndex === index}
                onMouseEnter={() => onSelect(index)}
                onFocus={() => onSelect(index)}
                onClick={() => onSelect(index)}
              >
                <span className="reports-bars__track">
                  <i
                    className={`reports-bars__bar reports-bars__bar--${metric}`}
                    style={{ height: `${percent}%` }}
                  />
                </span>
                <span className="reports-bars__label">{item.label}</span>
              </button>
            )
          })}
        </div>
      ) : (
        <div className="reports-lines">
          <svg
            className="reports-lines__svg"
            viewBox="0 0 600 220"
            role="group"
            aria-label={`${metricLabel} trend by month`}
            preserveAspectRatio="none"
          >
            {[25, 85, 145, 205].map((y) => (
              <line key={y} x1="40" x2="590" y1={y} y2={y} className="reports-lines__grid" />
            ))}
            {data.length > 1 && (
              <polyline
                className={`reports-lines__path reports-lines__path--${metric}`}
                points={data.map((item, index) => {
                  const x = 50 + (index * 530) / (data.length - 1)
                  const y = 195 - (item[metric] / maxValue) * 155
                  return `${x},${y}`
                }).join(' ')}
              />
            )}
            {data.map((item, index) => {
              const x = data.length === 1 ? 315 : 50 + (index * 530) / (data.length - 1)
              const y = 195 - (item[metric] / maxValue) * 155
              return (
                <g key={item.label}>
                  <circle
                    className={`reports-lines__point reports-lines__point--${metric}${selectedIndex === index ? ' is-selected' : ''}`}
                    cx={x}
                    cy={y}
                    r="6"
                    tabIndex="0"
                    role="button"
                    aria-label={`${item.label}: ${metric === 'sales' ? money(item.sales) : `${item.orders} orders`}`}
                    onMouseEnter={() => onSelect(index)}
                    onFocus={() => onSelect(index)}
                    onClick={() => onSelect(index)}
                  />
                  <text className="reports-lines__label" x={x} y="218" textAnchor="middle">
                    {item.label}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>
      )}

      <p className="reports-chart__detail" aria-live="polite">
        <strong>{active.label}</strong>
        <span>{numberFormat.format(active.orders)} orders</span>
        <span>{money(active.sales)} sales</span>
      </p>
    </div>
  )
}

export default function Reports({ orders }) {
  const [period, setPeriod] = useState('Last 6 months')
  const [chartType, setChartType] = useState('bar')
  const [metric, setMetric] = useState('sales')
  const [selectedMonth, setSelectedMonth] = useState(null)
  const [selectedStatus, setSelectedStatus] = useState(null)

  const periodOrders = useMemo(() => getDateRange(orders, period), [orders, period])
  const chartData = useMemo(() => makeMonthlySeries(periodOrders, period), [periodOrders, period])
  const average = periodOrders.length
    ? Math.round(periodOrders.reduce((sum, order) => sum + order.total, 0) / periodOrders.length)
    : 0
  const sales = periodOrders.reduce((sum, order) => sum + order.total, 0)
  const fulfilled = periodOrders.filter(
    (order) => ['Ready for pickup', 'Completed'].includes(order.status)
  ).length
  const fulfillmentRate = periodOrders.length
    ? Math.round((fulfilled / periodOrders.length) * 100)
    : 0

  const statusData = statusGroups.map((status) => ({
    ...status,
    count: periodOrders.filter((order) => order.status === status.label).length,
  }))
  const totalStatusCount = statusData.reduce((sum, item) => sum + item.count, 0)
  const selectedStatusData = statusData.find((item) => item.label === selectedStatus)
  const pieGradient = totalStatusCount
    ? (() => {
      let progress = 0
      return `conic-gradient(${statusData.map((item) => {
        const start = progress
        progress += (item.count / totalStatusCount) * 100
        const color = selectedStatus && selectedStatus !== item.label ? `${item.color}40` : item.color
        return `${color} ${start}% ${progress}%`
      }).join(', ')})`
    })()
    : 'conic-gradient(#e2e8f0 0% 100%)'

  const changePeriod = (nextPeriod) => {
    setPeriod(nextPeriod)
    setSelectedMonth(null)
    setSelectedStatus(null)
  }

  const toggleStatus = (status) => {
    setSelectedStatus((current) => (current === status ? null : status))
  }

  return (
    <div className="page-stack">
      <div className="report-toolbar">
        <span>Reporting period</span>
        <label className="select-control">
          <select value={period} onChange={(event) => changePeriod(event.target.value)}>
            <option>Last 6 months</option>
            <option>This month</option>
            <option>All time</option>
          </select>
          <Icon name="chevron" size={15} />
        </label>
        <button type="button" className="outline-control" onClick={() => window.print()}>
          <Icon name="arrow" size={15} /> Export report
        </button>
      </div>

      <div className="stats-grid">
        <StatCard
          label="Total sales"
          value={money(sales)}
          change={`${periodOrders.length} orders in selected period`}
          icon="chart"
          tone="green"
        />
        <StatCard
          label="Orders placed"
          value={numberFormat.format(periodOrders.length)}
          change={`${orders.length} orders overall`}
          icon="bag"
          tone="blue"
        />
        <StatCard
          label="Average sale"
          value={money(average)}
          change="Per order in selected period"
          icon="receipt"
          tone="purple"
        />
        <StatCard
          label="Fulfillment rate"
          value={`${fulfillmentRate}%`}
          change={`${fulfilled} ready or completed`}
          icon="check"
          tone="amber"
        />
      </div>

      <div className="report-grid">
        <section className="surface chart-surface">
          <PageIntro
            eyebrow="PERFORMANCE"
            title="Sales & orders over time"
            subtitle="Explore order volume and sales for each month."
          />
          <div className="reports-controls" aria-label="Chart controls">
            <div className="reports-toggle" role="group" aria-label="Chart type">
              {[
                { value: 'bar', label: 'Bar' },
                { value: 'line', label: 'Line' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={chartType === option.value ? 'is-active' : ''}
                  aria-pressed={chartType === option.value}
                  onClick={() => setChartType(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="reports-toggle" role="group" aria-label="Chart metric">
              {[
                { value: 'sales', label: 'Sales' },
                { value: 'orders', label: 'Orders' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={metric === option.value ? 'is-active' : ''}
                  aria-pressed={metric === option.value}
                  onClick={() => {
                    setMetric(option.value)
                    setSelectedMonth(null)
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div className="chart-legend reports-legend">
            <span><i className="legend-dot legend-dot--sales" />{metric === 'sales' ? 'Sales (PHP)' : 'Orders'}</span>
            <span>Hover or focus a month for details</span>
          </div>
          <OrdersChart
            data={chartData}
            metric={metric}
            chartType={chartType}
            selectedIndex={selectedMonth}
            onSelect={setSelectedMonth}
          />
          <div className="chart-foot">
            <span><Icon name="chart" size={15} /> Based on recorded orders</span>
            <span>{period}</span>
          </div>
        </section>

        <section className="surface category-surface">
          <PageIntro
            eyebrow="BREAKDOWN"
            title="Orders by status"
            subtitle="Select a status to highlight its share."
          />
          <div className="donut-wrap">
            <div
              className={`donut-chart reports-donut${selectedStatus ? ' is-filtered' : ''}`}
              style={{ background: pieGradient }}
              role="img"
              aria-label={`Pie chart of ${totalStatusCount} orders by status`}
            >
              <div>
                <strong>
                  {selectedStatusData
                    ? numberFormat.format(selectedStatusData.count)
                    : numberFormat.format(totalStatusCount)}
                </strong>
                <span>{selectedStatusData ? selectedStatusData.label : 'Total orders'}</span>
              </div>
            </div>
            <div className="donut-legend reports-donut-legend">
              {statusData.map((item) => {
                const percentage = totalStatusCount
                  ? Math.round((item.count / totalStatusCount) * 100)
                  : 0
                const isSelected = selectedStatus === item.label
                return (
                  <button
                    key={item.label}
                    type="button"
                    className={`reports-status${isSelected ? ' is-selected' : ''}`}
                    aria-pressed={isSelected}
                    onClick={() => toggleStatus(item.label)}
                  >
                    <i style={{ '--status-color': item.color }} />
                    <span>{item.label}</span>
                    <strong>{item.count} · {percentage}%</strong>
                  </button>
                )
              })}
            </div>
          </div>
          <div className="category-insight reports-insight">
            <span aria-hidden="true">✦</span>
            <p>
              {selectedStatusData
                ? <><strong>{selectedStatusData.label}.</strong> {selectedStatusData.count} orders in this period.</>
                : <><strong>{totalStatusCount ? 'Live order status.' : 'No orders yet.'}</strong> This breakdown updates as order statuses change.</>}
            </p>
          </div>
        </section>
      </div>

      <section className="surface top-products-surface">
        <PageIntro
          eyebrow="SALES SUMMARY"
          title="Period totals"
          subtitle="Sales and order counts used in the charts above."
        />
        <div className="reports-summary">
          <div><span>Sales</span><strong>{money(sales)}</strong></div>
          <div><span>Orders</span><strong>{numberFormat.format(periodOrders.length)}</strong></div>
          <div><span>Average order</span><strong>{money(average)}</strong></div>
          <div><span>Ready or completed</span><strong>{numberFormat.format(fulfilled)}</strong></div>
        </div>
      </section>
    </div>
  )
}
