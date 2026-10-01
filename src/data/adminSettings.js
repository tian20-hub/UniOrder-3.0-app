export const paymentOptions = ['Cash at campus', 'GCash', 'Bank transfer']

export const defaultAdminSettings = {
  orderingEnabled: true,
  orderDeadline: '',
  maxItemsPerOrder: 0,
  paymentMethods: ['Cash at campus', 'GCash'],
  paymentInstructions: 'Choose a payment method at checkout. Finance will confirm your payment before your order is prepared.',
  announcement: '',
  terms: 'Please check your order details before submitting. Orders are subject to stock availability and campus payment confirmation.',
}

export function readAdminSettings() {
  try {
    const saved = window.localStorage.getItem('uniorder-admin-settings')
    if (!saved) return defaultAdminSettings

    const value = JSON.parse(saved)
    if (!value || typeof value !== 'object' || Array.isArray(value)) return defaultAdminSettings
    const paymentMethods = Array.isArray(value.paymentMethods)
      ? paymentOptions.filter((method) => value.paymentMethods.includes(method))
      : defaultAdminSettings.paymentMethods

    return {
      orderingEnabled: typeof value.orderingEnabled === 'boolean'
        ? value.orderingEnabled
        : defaultAdminSettings.orderingEnabled,
      orderDeadline: typeof value.orderDeadline === 'string' ? value.orderDeadline : '',
      maxItemsPerOrder: Number.isInteger(value.maxItemsPerOrder) && value.maxItemsPerOrder >= 0
        ? value.maxItemsPerOrder
        : defaultAdminSettings.maxItemsPerOrder,
      paymentMethods,
      paymentInstructions: typeof value.paymentInstructions === 'string'
        ? value.paymentInstructions
        : defaultAdminSettings.paymentInstructions,
      announcement: typeof value.announcement === 'string' ? value.announcement : '',
      terms: typeof value.terms === 'string' ? value.terms : defaultAdminSettings.terms,
    }
  } catch (error) {
    console.error('Unable to load administrator settings.', error)
    return defaultAdminSettings
  }
}
