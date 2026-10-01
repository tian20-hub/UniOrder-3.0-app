export const ETB_TO_PHP_RATE = 0.386086

export function convertEtbToPhp(amount) {
  return Math.round((amount * ETB_TO_PHP_RATE + Number.EPSILON) * 100) / 100
}

export function formatPhp(amount) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount)
}

export function formatEtbAsPhp(amount) {
  return formatPhp(convertEtbToPhp(amount))
}
