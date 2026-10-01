import React from 'react'
import { Badge, Icon, PageIntro, StatCard } from './Shared'
import { formatPhp } from '../utils/currency'

function statusTone(status) {
  if (status === 'Completed' || status === 'Ready for pickup') return 'green'
  if (status === 'Processing') return 'blue'
  if (status === 'Awaiting payment') return 'amber'
  return 'neutral'
}

export default function OrderHistory({ orders }) {
  return (
    <div className="page-stack">
      <div className="stats-grid stats-grid--three">
        <StatCard
          label="Total orders"
          value={orders.length}
          change="Since joining"
          icon="bag"
          tone="blue"
        />
        <StatCard
          label="Ready for pickup"
          value={orders.filter((order) => order.status === 'Ready for pickup').length}
          change="Visit the campus shop"
          icon="package"
          tone="green"
        />
        <StatCard
          label="In progress"
          value={orders.filter((order) => ['Processing', 'Awaiting payment'].includes(order.status)).length}
          change="We'll keep you updated"
          icon="clock"
          tone="amber"
        />
      </div>

      <section className="surface order-history">
        <PageIntro
          eyebrow="YOUR ACTIVITY"
          title="Your orders"
          subtitle="All the details, right where you need them."
        />
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ORDER</th>
                <th>DATE</th>
                <th>ITEMS</th>
                <th>TOTAL</th>
                <th>STATUS</th>
                <th>
                  <span className="sr-only">Details</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <strong className="order-id">{order.id}</strong>
                  </td>
                  <td>{order.date}</td>
                  <td>{order.items}</td>
                  <td>
                    <strong>{formatPhp(order.total)}</strong>
                  </td>
                  <td>
                    <Badge tone={statusTone(order.status)}>
                      <span className="badge-dot" />
                      {order.status}
                    </Badge>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="row-link"
                      aria-label={`View order ${order.id}`}
                    >
                      <Icon name="arrow" size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {!orders.length && (
                <tr>
                  <td colSpan="6" className="table-empty">
                    No orders yet. Head to the catalog to find your uniform.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="order-help">
          <div className="order-help__icon">?</div>
          <div>
            <strong>Need a hand with an order?</strong>
            <span>Our campus shop team is happy to help.</span>
          </div>
          <button type="button">
            Contact support <Icon name="arrow" size={15} />
          </button>
        </div>
      </section>
    </div>
  )
}
