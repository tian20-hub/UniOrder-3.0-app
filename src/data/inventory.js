export const initialInventory = [
  { id: 'UNI-001', name: 'Classic School Polo Shirt', category: 'Tops', color: 'Sky blue', course: 'All courses', stock: 24, minimum: 12, price: 420 },
  { id: 'UNI-002', name: 'Everyday uniform trousers', category: 'Bottoms', color: 'Deep navy', course: 'All courses', stock: 8, minimum: 10, price: 680 },
  { id: 'UNI-003', name: 'Academy Cardigan', category: 'Layers', color: 'Academy navy', course: 'All courses', stock: 12, minimum: 8, price: 950 },
  { id: 'UNI-004', name: 'Pleated uniform skirt', category: 'Bottoms', color: 'Slate', course: 'All courses', stock: 5, minimum: 8, price: 610 },
  { id: 'UNI-005', name: 'Long-Sleeve Oxford Shirt', category: 'Tops', color: 'Cloud white', course: 'All courses', stock: 31, minimum: 12, price: 520 },
  { id: 'UNI-006', name: 'House Sports T-Shirt', category: 'Sportswear', color: 'Forest green', course: 'All courses', stock: 16, minimum: 8, price: 360 },
]

function isInventoryItem(item) {
  return item
    && typeof item.id === 'string'
    && typeof item.name === 'string'
    && typeof item.category === 'string'
    && typeof item.color === 'string'
    && (item.course === undefined || typeof item.course === 'string')
    && Number.isInteger(item.stock)
    && item.stock >= 0
    && Number.isInteger(item.minimum)
    && item.minimum >= 0
    && Number.isFinite(item.price)
    && item.price > 0
}

export function readInventory() {
  try {
    const saved = window.localStorage.getItem('uniorder-inventory')
    if (!saved) return initialInventory

    const inventory = JSON.parse(saved)
    if (!Array.isArray(inventory) || !inventory.every(isInventoryItem)) return initialInventory
    return inventory.map((item) => ({
      ...item,
      course: item.course || 'All courses',
    }))
  } catch (error) {
    console.error('Unable to load saved inventory.', error)
    return initialInventory
  }
}
