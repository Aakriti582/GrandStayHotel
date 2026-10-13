/**
 * Sample data for developing the UI before the Django API exists.
 * Prices here are placeholders for local development, not real hotel rates.
 * Shapes mirror what the DRF serializers should return (money as strings).
 */

export const roomTypes = [
  {
    id: 1,
    name: 'Standard Room',
    description: 'A quiet room for short stays and business trips.',
    max_occupancy: 2,
    bed: 'Queen bed',
    nightly_rate: '180.00',
    total_rooms: 12,
  },
  {
    id: 2,
    name: 'Deluxe Room',
    description: 'More space, a work desk and a seating corner.',
    max_occupancy: 2,
    bed: 'King bed',
    nightly_rate: '260.00',
    total_rooms: 2,
  },
  {
    id: 3,
    name: 'Family Suite',
    description: 'Two connected rooms for families travelling together.',
    max_occupancy: 4,
    bed: 'King + 2 singles',
    nightly_rate: '420.00',
    total_rooms: 4,
  },
  {
    id: 4,
    name: 'Executive Suite',
    description: 'Separate living area, suited to long stays.',
    max_occupancy: 2,
    bed: 'King bed',
    nightly_rate: '560.00',
    total_rooms: 3,
  },
]

export const mealPackages = [
  { id: 1, code: 'NONE', name: 'Room only', description: 'No meals included', price_per_guest_per_day: '0.00' },
  { id: 2, code: 'BREAKFAST', name: 'Breakfast', description: 'Daily breakfast buffet', price_per_guest_per_day: '35.00' },
  { id: 3, code: 'HALF', name: 'Half board', description: 'Breakfast and dinner', price_per_guest_per_day: '80.00' },
  { id: 4, code: 'FULL', name: 'Full board', description: 'All three meals', price_per_guest_per_day: '115.00' },
]

/** pricing_type matches AddOnService on the backend: FLAT, PER_GUEST or PER_DAY. */
export const addOns = [
  { id: 1, name: 'Airport pickup', description: 'One-way transfer on arrival', pricing_type: 'FLAT', price: '90.00' },
  { id: 2, name: 'Spa session', description: 'Scheduled during your stay', pricing_type: 'PER_GUEST', price: '150.00' },
  { id: 3, name: 'Late checkout', description: 'Subject to availability', pricing_type: 'FLAT', price: '60.00' },
  { id: 4, name: 'Meeting room', description: 'Half-day booking for up to 10 people', pricing_type: 'FLAT', price: '300.00' },
]

/** Sample tax rate for mocks only. The backend owns the real calculation. */
export const MOCK_TAX_RATE = 0.06

/** How long an unpaid reservation is held, mirroring the Celery expiry job. */
export const MOCK_HOLD_MINUTES = 15
