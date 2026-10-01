import React, { useEffect, useState } from 'react'
import { Badge, Icon, PageIntro, StatCard } from './Shared'
import { formatPhp } from '../utils/currency'

function statusTone(status) {
  if (status === 'Completed' || status === 'Ready for pickup') return 'green'
  if (status === 'Processing') return 'blue'
  if (status === 'Awaiting payment') return 'amber'
  return 'neutral'
}

export default function OrderHistory({ orders, onNotify }) {
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [supportOpen, setSupportOpen] = useState(false)
  const [supportOrderId, setSupportOrderId] = useState('')
  const [supportMessage, setSupportMessage] = useState('')

  useEffect(() => {
    if (!selectedOrder && !supportOpen) return undefined
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setSelectedOrder(null)
        setSupportOpen(false)
      }
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [selectedOrder, supportOpen])

  const copySupportRequest = async (event) => {
    event.preventDefault()
    const order = orders.find((item) => item.id === supportOrderId)
    const request = [
      'Hello, I need help with my uniform order.',
      order && `Order: ${order.id}`,
      order && `Status: ${order.status}`,
      order && `Total: ${formatPhp(order.total)}`,
      supportMessage.trim(),
    ].filter(Boolean).join('\n')

    try {
      await navigator.clipboard.writeText(request)
      setSupportOpen(false)
      onNotify('Support request copied. Send it through your campus shop support channel.')
    } catch (error) {
      console.error('Unable to copy the support request.', error)
      onNotify('Could not copy the support request. Check clipboard permissions and try again.')
    }
  }

  return (
    <div className="page-stack">
      <div className="stats-grid stats-grid--three order-stats">
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
                      aria-haspopup="dialog"
                      onClick={() => setSelectedOrder(order)}
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
          <button type="button" onClick={() => {
            setSupportOrderId(orders[0]?.id || '')
            setSupportMessage('')
            setSupportOpen(true)
          }}>
            Contact support <Icon name="arrow" size={15} />
          </button>
        </div>
      </section>
      {selectedOrder && (
        <div
          className="order-dialog-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedOrder(null)
          }}
        >
          <section
            className="order-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-dialog-title"
          >
            <div className="order-dialog__header">
              <div>
                <span>ORDER DETAILS</span>
                <h2 id="order-dialog-title">{selectedOrder.id}</h2>
              </div>
              <button
                type="button"
                className="icon-button"
                aria-label="Close order details"
                onClick={() => setSelectedOrder(null)}
              >
                ×
              </button>
            </div>
            <dl className="order-dialog__details">
              <div><dt>Date placed</dt><dd>{selectedOrder.date}</dd></div>
              <div><dt>Items</dt><dd>{selectedOrder.items}</dd></div>
              <div><dt>Total</dt><dd>{formatPhp(selectedOrder.total)}</dd></div>
              <div><dt>Status</dt><dd><Badge tone={statusTone(selectedOrder.status)}>{selectedOrder.status}</Badge></dd></div>
            </dl>
            {selectedOrder.orderDetails?.length > 0 && (
              <div className="order-dialog__items">
                <strong>Items and sizes</strong>
                {selectedOrder.orderDetails.map((item, index) => (
                  <div key={`${item.name}-${item.size}-${index}`}>
                    <span>{item.name} · {item.course} · Size {item.size} × {item.quantity}</span>
                    <strong>{formatPhp(item.unitPrice * item.quantity)}</strong>
                  </div>
                ))}
              </div>
            )}
            <button
              type="button"
              className="button button--primary"
              onClick={() => {
                setSupportOrderId(selectedOrder.id)
                setSelectedOrder(null)
                setSupportMessage('')
                setSupportOpen(true)
              }}
            >
              <Icon name="receipt" size={16} /> Get help with this order
            </button>
          </section>
        </div>
      )}
      {supportOpen && (
        <div
          className="order-dialog-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSupportOpen(false)
          }}
        >
          <section
            className="order-dialog order-support-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="support-dialog-title"
          >
            <div className="order-dialog__header">
              <div>
                <span>CAMPUS SHOP</span>
                <h2 id="support-dialog-title">Contact support</h2>
              </div>
              <button
                type="button"
                className="icon-button"
                aria-label="Close support request"
                onClick={() => setSupportOpen(false)}
              >
                ×
              </button>
            </div>
            <p className="order-support-dialog__note">
              Copy a ready-to-send request, then share it through your campus shop support channel.
            </p>
            <form onSubmit={copySupportRequest}>
              <label htmlFor="support-order">Order</label>
              <select
                id="support-order"
                value={supportOrderId}
                onChange={(event) => setSupportOrderId(event.target.value)}
              >
                <option value="">General question</option>
                {orders.map((order) => (
                  <option key={order.id} value={order.id}>{order.id} · {order.status}</option>
                ))}
              </select>
              <label htmlFor="support-message">What do you need help with?</label>
              <textarea
                id="support-message"
                rows="4"
                value={supportMessage}
                onChange={(event) => setSupportMessage(event.target.value)}
                placeholder="Add a short message (optional)"
              />
              <div className="order-dialog__actions">
                <button type="button" className="button button--outline" onClick={() => setSupportOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="button button--primary">
                  <Icon name="receipt" size={16} /> Copy request
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}
