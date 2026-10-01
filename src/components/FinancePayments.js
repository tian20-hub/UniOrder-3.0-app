import React, { useMemo, useState } from 'react'
import { Badge, Button, Icon, PageIntro, StatCard } from './Shared'

function paymentTone(status) {
  if (status === 'Completed') return 'green'
  if (status === 'Ready for pickup') return 'blue'
  if (status === 'Processing') return 'purple'
  return 'amber'
}

export default function FinancePayments({ orders, onUpdateOrders, onNotify }) {
  const [filter, setFilter] = useState('All orders')

  const pending = orders.filter((order) => order.status === 'Awaiting payment')
  const ready = orders.filter((order) => order.status === 'Ready for pickup')

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (filter === 'Needs confirmation') return order.status === 'Awaiting payment'
      if (filter === 'Ready to release') return order.status === 'Ready for pickup'
      return true
    })
  }, [orders, filter])

  const revenue = orders
    .filter((order) => order.status !== 'Awaiting payment')
    .reduce((sum, order) => sum + order.total, 0)

  const updateOrder = (id, nextStatus) => {
    onUpdateOrders((current) =>
      current.map((order) => (order.id === id ? { ...order, status: nextStatus } : order))
    )
    onNotify(
      nextStatus === 'Processing'
        ? 'Payment confirmed. The order is now processing.'
        : 'Order released and marked complete.'
    )
  }

  return (
    <div className="page-stack">
      <div className="stats-grid">
        <StatCard
          label="Collected this term"
          value={`${revenue.toLocaleString()} ETB`}
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
            <strong>{pending.length + ready.length} orders need your attention</strong>
            <span>Confirm incoming payments, then release orders for pickup.</span>
          </div>
        </div>
        <div className="table-toolbar">
          <div className="table-tabs">
            {['All orders', 'Needs confirmation', 'Ready to release'].map((item) => (
              <button
                key={item}
                type="button"
                className={filter === item ? 'table-tab table-tab--active' : 'table-tab'}
                onClick={() => setFilter(item)}
              >
                {item}
                {item === 'Needs confirmation' && pending.length > 0 && <span>{pending.length}</span>}
                {item === 'Ready to release' && ready.length > 0 && <span>{ready.length}</span>}
              </button>
            ))}
          </div>
          <span className="table-count">{filteredOrders.length} orders</span>
        </div>
        <div className="table-wrap">
          <table className="data-table finance-table">
            <thead>
              <tr>
                <th>ORDER</th>
                <th>DATE</th>
                <th>STUDENT</th>
                <th>AMOUNT</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order, index) => (
                <tr key={order.id}>
                  <td>
                    <strong className="order-id">{order.id}</strong>
                  </td>
                  <td>{order.date}</td>
                  <td>
                    <div className="person-cell">
                      <span className={`mini-avatar mini-avatar--${index % 3}`}>
                        {['AM', 'DK', 'SA'][index % 3]}
                      </span>
                      {['Amina Mekonnen', 'Daniel Kebede', 'Sara Abebe'][index % 3]}
                    </div>
                  </td>
                  <td>
                    <strong>{order.total.toLocaleString()} ETB</strong>
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
                        onClick={() => updateOrder(order.id, 'Processing')}
                      >
                        <Icon name="check" size={15} /> Confirm payment
                      </Button>
                    ) : order.status === 'Ready for pickup' ? (
                      <Button
                        className="table-action table-action--release"
                        onClick={() => updateOrder(order.id, 'Completed')}
                      >
                        Release order <Icon name="arrow" size={14} />
                      </Button>
                    ) : (
                      <span className="muted-action">
                        {order.status === 'Completed' ? 'Released' : 'In progress'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {!filteredOrders.length && (
                <tr>
                  <td colSpan="6" className="table-empty">
                    Nothing waiting in this queue.
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
          Every confirmation is logged to the campus finance record.
        </div>
      </section>
    </div>
  )
}

