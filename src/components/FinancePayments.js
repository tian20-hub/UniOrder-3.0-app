import { useMemo, useState } from 'react'
import { Badge, Button, Icon, PageIntro, StatCard } from './Shared'
import { formatPhp } from '../utils/currency'

function paymentTone(status) {
  if (status === 'Completed') return 'green'
  if (status === 'Ready for pickup') return 'blue'
  if (status === 'Processing') return 'purple'
  if (status === 'Cancelled') return 'neutral'
  return 'amber'
}

function submittedTimestamp(order) {
  const timestamp = order.submittedAt || order.date
  const parsed = new Date(timestamp)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function formatSubmittedAt(order) {
  if (!order.submittedAt) {
    return order.date ? `${order.date} · time not recorded` : 'Time not recorded'
  }
  const timestamp = submittedTimestamp(order)
  if (!timestamp) return 'Time not recorded'
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(timestamp)
}

export default function FinancePayments({
  orders,
  requests = [],
  onUpdateOrder,
  onResolveRequest,
}) {
  const [filter, setFilter] = useState('All orders')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  const pending = orders.filter((order) => order.status === 'Awaiting payment')
  const ready = orders.filter((order) => order.status === 'Ready for pickup')
  const processing = orders.filter((order) => order.status === 'Processing')
  const openRequests = requests.filter((request) => request.status === 'Open')

  const filteredOrders = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    const visibleOrders = orders.filter((order) => {
      if (filter === 'Needs confirmation') return order.status === 'Awaiting payment'
      if (filter === 'In preparation') return order.status === 'Processing'
      if (filter === 'Ready to release') return order.status === 'Ready for pickup'
      return true
    }).filter((order) => {
      if (!normalizedSearch) return true
      return [
        order.id,
        order.date,
        order.submittedBy || 'Student',
        formatSubmittedAt(order),
        order.status,
        order.paymentMethod || '',
        formatPhp(order.total),
      ].some((value) => String(value).toLowerCase().includes(normalizedSearch))
    })

    return [...visibleOrders].sort((first, second) => {
      if (sortBy === 'oldest' || sortBy === 'newest') {
        const difference = (submittedTimestamp(first)?.getTime() || 0) - (submittedTimestamp(second)?.getTime() || 0)
        return sortBy === 'newest' ? -difference : difference
      }
      return sortBy === 'highest'
        ? second.total - first.total
        : first.total - second.total
    })
  }, [orders, filter, search, sortBy])

  const revenue = orders
    .filter((order) => order.status !== 'Awaiting payment')
    .reduce((sum, order) => sum + order.total, 0)

  const updateOrder = async (order, nextStatus) => {
    await onUpdateOrder(order, nextStatus)
  }

  return (
    <div className="page-stack">
      <div className="stats-grid finance-stats">
        <StatCard
          label="Collected this term"
          value={formatPhp(revenue)}
          change="Across confirmed orders"
          icon="chart"
          tone="green"
        />
        <StatCard
          label="Awaiting confirmation"
          value={pending.length}
          change="Payment needs review"
          icon="clock"
          tone="amber"
        />
        <StatCard
          label="Ready to release"
          value={ready.length}
          change="Payment confirmed"
          icon="package"
          tone="blue"
        />
        <StatCard
          label="Orders processed"
          value={orders.filter((order) => order.status === 'Completed').length}
          change="This term"
          icon="check"
          tone="purple"
        />
      </div>

      <section className="surface finance-surface">
        <PageIntro
          eyebrow="FINANCE DESK"
          title="Payment & release queue"
          subtitle="Confirm payments and release completed uniform orders."
          action={
            <div className="secure-note">
              <Icon name="shield" size={16} /> Secure finance workspace
            </div>
          }
        />
        <div className="queue-notice">
          <div className="queue-notice__icon">
            <Icon name="receipt" size={19} />
          </div>
          <div>
            <strong>{pending.length + processing.length + ready.length} orders need your attention</strong>
            <span>Confirm payment, prepare the order, and release it through the campus workflow.</span>
          </div>
        </div>
        <div className="finance-queue-controls">
          <div className="table-toolbar">
            <div className="table-tabs" role="group" aria-label="Filter orders">
              {['All orders', 'Needs confirmation', 'In preparation', 'Ready to release'].map((item) => (
                <button
                  key={item}
                  type="button"
                  className={filter === item ? 'table-tab table-tab--active' : 'table-tab'}
                  aria-pressed={filter === item}
                  onClick={() => setFilter(item)}
                >
                  {item}
                  {item === 'Needs confirmation' && pending.length > 0 && <span>{pending.length}</span>}
                  {item === 'In preparation' && processing.length > 0 && <span>{processing.length}</span>}
                  {item === 'Ready to release' && ready.length > 0 && <span>{ready.length}</span>}
                </button>
              ))}
            </div>
            <span className="table-count">{filteredOrders.length} orders</span>
          </div>

          <div className="finance-queue-tools">
            <div className="table-search finance-search">
              <Icon name="search" size={16} />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search order, student, date, status, amount"
                aria-label="Search payment orders"
              />
              {search && (
                <button
                  type="button"
                  className="finance-search__clear"
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                >
                  <Icon name="close" size={14} />
                </button>
              )}
            </div>
            <label className="finance-sort">
              <span>Sort by</span>
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="highest">Highest amount</option>
                <option value="lowest">Lowest amount</option>
              </select>
            </label>
          </div>
        </div>
        <div className="table-wrap">
          <table className="data-table finance-table">
            <thead>
              <tr>
                <th>ORDER</th>
                <th>SUBMITTED</th>
                <th>SENT BY</th>
                <th>AMOUNT</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order, index) => (
                <tr key={order.id} className="finance-order-row">
                  <td>
                    <strong className="order-id">{order.id}</strong>
                    <span className="finance-order-items">{order.items}</span>
                    <span className="finance-order-items">
                      {order.paymentMethod || 'Payment method not specified'}
                    </span>
                  </td>
                  <td>
                    <time dateTime={order.submittedAt || undefined} title={order.date}>
                      {formatSubmittedAt(order)}
                    </time>
                  </td>
                  <td>
                    <div className="person-cell">
                      <span className={`mini-avatar mini-avatar--${index % 3}`}>
                        {(order.submittedBy || 'Student')
                          .trim()
                          .split(/\s+/)
                          .slice(0, 2)
                          .map((part) => part[0]?.toUpperCase() || '')
                          .join('')}
                      </span>
                      <span className="finance-order-sender">{order.submittedBy || 'Student account'}</span>
                    </div>
                  </td>
                  <td>
                    <strong>{formatPhp(order.total)}</strong>
                  </td>
                  <td>
                    <Badge tone={paymentTone(order.status)}>
                      <span className="badge-dot" />
                      {order.status}
                    </Badge>
                  </td>
                  <td>
                    {order.status === 'Awaiting payment' ? (
                      <Button
                        className="table-action"
                        onClick={() => updateOrder(order, 'Processing')}
                      >
                        <Icon name="check" size={15} /> Confirm payment
                      </Button>
                    ) : order.status === 'Processing' ? (
                      <Button
                        className="table-action"
                        onClick={() => updateOrder(order, 'Ready for pickup')}
                      >
                        <Icon name="package" size={15} /> Mark ready
                      </Button>
                    ) : order.status === 'Ready for pickup' ? (
                      <Button
                        className="table-action table-action--release"
                        onClick={() => updateOrder(order, 'Completed')}
                      >
                        Release order <Icon name="arrow" size={14} />
                      </Button>
                    ) : (
                      <span className="muted-action">
                        {order.status === 'Completed' ? 'Released' : order.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {!filteredOrders.length && (
                <tr>
                  <td colSpan="6" className="table-empty">
                    {search
                      ? `No orders match “${search}”. Try another search.`
                      : 'Nothing waiting in this queue.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="finance-footnote">
          <span className="finance-footnote__check">
            <Icon name="check" size={13} />
          </span>{' '}
          Order changes are recorded in the order history.
        </div>
      </section>
      <section className="surface finance-requests">
        <PageIntro
          eyebrow="STUDENT REQUESTS"
          title="Exchanges & returns"
          subtitle={`${openRequests.length} request${openRequests.length === 1 ? '' : 's'} waiting for review.`}
        />
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>ORDER</th><th>REQUEST</th><th>DETAILS</th><th>SUBMITTED</th><th>ACTION</th></tr>
            </thead>
            <tbody>
              {openRequests.map((request) => (
                <tr key={request.id}>
                  <td><strong className="order-id">{request.orderNumber}</strong></td>
                  <td>{request.request_type}</td>
                  <td>{request.message || 'No additional details.'}</td>
                  <td>{formatSubmittedAt({ submittedAt: request.created_at })}</td>
                  <td>
                    <div className="finance-request-actions">
                      <Button className="table-action" onClick={() => onResolveRequest(request, 'Resolved')}>
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        className="table-action"
                        onClick={() => onResolveRequest(request, 'Declined')}
                      >
                        Decline
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!openRequests.length && (
                <tr><td colSpan="5" className="table-empty">No exchange or return requests to review.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
