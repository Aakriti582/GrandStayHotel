/**
 * Client-side price ESTIMATE for the summary panel while the guest is choosing.
 * The backend's provisional invoice is the source of truth; this only gives
 * instant feedback, and it excludes tax.
 */
export function estimateBooking({ roomType, search, mealPackage, addOns }) {
  if (!roomType || !search) return null
  const nights = search.nights
  const room = Number(roomType.nightly_rate) * nights * search.rooms
  const meals = mealPackage ? Number(mealPackage.price_per_guest_per_day) * search.guests * nights : 0
  const extras = addOns.reduce((sum, addOn) => {
    const qty = addOn.pricing_type === 'PER_GUEST' ? search.guests : addOn.pricing_type === 'PER_DAY' ? nights : 1
    return sum + Number(addOn.price) * qty
  }, 0)
  return { room, meals, extras, subtotal: room + meals + extras }
}

export function describeAddOnPrice(addOn) {
  switch (addOn.pricing_type) {
    case 'PER_GUEST':
      return 'per guest'
    case 'PER_DAY':
      return 'per day'
    default:
      return ''
  }
}
