/**
 * In-browser stand-in for the booking endpoints. It follows the same rules the
 * backend will enforce (pricing snapshots, a payment hold that expires) so the
 * UI is built against realistic behaviour from day one.
 */
import { nightsBetween } from '@/lib/format'
import { addOns, MOCK_HOLD_MINUTES, MOCK_TAX_RATE, mealPackages, roomTypes } from './fixtures'

const STORAGE_KEY = 'grandstay.mock.reservations'
const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms))
const money = (n) => (Math.round(n * 100) / 100).toFixed(2)

function loadAll() {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) ?? {}
  } catch {
    return {}
  }
}

function saveAll(all) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  } catch {
    // Storage can be unavailable (private mode); mocks still work in memory.
  }
}

function mockError(status, detail) {
  const error = new Error(detail)
  error.response = { status, data: { detail } }
  return error
}

/** Mirrors the Celery Beat job: expire unpaid reservations past their deadline. */
function expireIfOverdue(reservation) {
  if (reservation.status === 'PENDING_PAYMENT' && new Date(reservation.payment_deadline) <= new Date()) {
    return { ...reservation, status: 'EXPIRED' }
  }
  return reservation
}

export async function searchAvailability({ checkIn, checkOut, guests, rooms }) {
  await delay()
  if (nightsBetween(checkIn, checkOut) < 1) {
    throw mockError(400, 'Check-out must be at least one night after check-in.')
  }
  const guestsPerRoom = Math.ceil(guests / rooms)
  return roomTypes
    .filter((type) => type.max_occupancy >= guestsPerRoom)
    .map(({ total_rooms, ...type }) => ({ ...type, available_count: total_rooms }))
    .filter((type) => type.available_count >= rooms)
}

export async function listMealPackages() {
  await delay(150)
  return mealPackages
}

export async function listAddOns() {
  await delay(150)
  return addOns
}

export async function createReservation(payload) {
  await delay(500)
  const type = roomTypes.find((t) => t.id === payload.room_type_id)
  if (!type) throw mockError(400, 'That room type is no longer available.')

  const nights = nightsBetween(payload.check_in, payload.check_out)
  const meal = mealPackages.find((m) => m.id === payload.meal_package_id)
  const lines = [
    {
      description: `${type.name} · nightly`,
      quantity: nights * payload.rooms,
      unit_price: type.nightly_rate,
      line_total: money(Number(type.nightly_rate) * nights * payload.rooms),
    },
  ]

  if (meal && Number(meal.price_per_guest_per_day) > 0) {
    const qty = payload.num_guests * nights
    lines.push({
      description: `${meal.name} package`,
      quantity: qty,
      unit_price: meal.price_per_guest_per_day,
      line_total: money(Number(meal.price_per_guest_per_day) * qty),
    })
  }

  for (const { id } of payload.add_ons) {
    const addOn = addOns.find((a) => a.id === id)
    if (!addOn) continue
    const qty = addOn.pricing_type === 'PER_GUEST' ? payload.num_guests : addOn.pricing_type === 'PER_DAY' ? nights : 1
    lines.push({
      description: addOn.name,
      quantity: qty,
      unit_price: addOn.price,
      line_total: money(Number(addOn.price) * qty),
    })
  }

  const subtotal = lines.reduce((sum, line) => sum + Number(line.line_total), 0)
  const tax = subtotal * MOCK_TAX_RATE
  const all = loadAll()
  const sequence = Object.keys(all).length + 1
  const year = new Date().getFullYear()
  const reference = `GS-${year}-${String(100000 + sequence).slice(-6)}`

  const reservation = {
    reference,
    status: 'PENDING_PAYMENT',
    room_type: { id: type.id, name: type.name },
    rooms: payload.rooms,
    check_in: payload.check_in,
    check_out: payload.check_out,
    nights,
    num_guests: payload.num_guests,
    meal_package: meal ? { id: meal.id, name: meal.name } : null,
    add_ons: payload.add_ons.map(({ id }) => addOns.find((a) => a.id === id)?.name).filter(Boolean),
    special_requests: payload.special_requests,
    guest: payload.guest,
    payment_deadline: new Date(Date.now() + MOCK_HOLD_MINUTES * 60_000).toISOString(),
    assigned_rooms: [],
    invoice: {
      reference: `INV-${reference.slice(3)}`,
      kind: 'PROVISIONAL',
      status: 'ISSUED',
      lines,
      subtotal: money(subtotal),
      tax: money(tax),
      total: money(subtotal + tax),
    },
  }

  all[reference] = reservation
  saveAll(all)
  return reservation
}

export async function getReservation(reference) {
  await delay(200)
  const all = loadAll()
  const found = all[reference]
  if (!found) throw mockError(404, 'Reservation not found.')
  const current = expireIfOverdue(found)
  if (current !== found) {
    all[reference] = current
    saveAll(all)
  }
  return current
}

export async function payReservation(reference, { method }) {
  await delay(900)
  const all = loadAll()
  const found = all[reference]
  if (!found) throw mockError(404, 'Reservation not found.')
  const current = expireIfOverdue(found)
  if (current.status === 'EXPIRED') {
    all[reference] = current
    saveAll(all)
    throw mockError(409, 'This reservation expired before payment and the room was released.')
  }
  if (current.status !== 'PENDING_PAYMENT') throw mockError(409, 'This reservation has already been paid.')

  // The real backend assigns the room it was already holding internally.
  const firstRoom = 200 + current.room_type.id * 10
  const confirmed = {
    ...current,
    status: 'CONFIRMED',
    confirmed_at: new Date().toISOString(),
    payment: { method, status: 'SUCCEEDED' },
    invoice: { ...current.invoice, status: 'PAID' },
    assigned_rooms: Array.from({ length: current.rooms }, (_, i) => ({
      number: String(firstRoom + i + 1),
      floor: Math.floor((firstRoom + i + 1) / 100),
    })),
  }
  all[reference] = confirmed
  saveAll(all)
  return confirmed
}
