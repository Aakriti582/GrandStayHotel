import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAddOns, useCreateReservation, useMealPackages } from '@/api/queries'
import Alert from '@/components/ui/Alert'
import { getErrorMessage } from '@/lib/apiClient'
import { formatDate, formatMoney, nightsBetween, plural } from '@/lib/format'
import { describeAddOnPrice, estimateBooking } from '@/lib/pricing'
import { useBookingStore } from '@/store/bookingStore'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateGuest(guest) {
  const errors = {}
  if (!guest.fullName.trim()) errors.fullName = 'Enter the lead guest’s full name.'
  if (!EMAIL_PATTERN.test(guest.email.trim())) errors.email = 'Enter a valid email so we can send your receipt.'
  if (guest.phone.replace(/\D/g, '').length < 7) errors.phone = 'Enter a phone number we can reach you on.'
  return errors
}

export default function DetailsPage() {
  const navigate = useNavigate()
  const booking = useBookingStore()
  const mealPackages = useMealPackages()
  const addOns = useAddOns()
  const createReservation = useCreateReservation()
  const [errors, setErrors] = useState({})

  if (!booking.search || !booking.roomType) return <Navigate to="/rooms" replace />

  const { search, roomType, guest } = booking
  const nights = nightsBetween(search.checkIn, search.checkOut)
  const meals = mealPackages.data ?? []
  const extras = addOns.data ?? []
  const selectedMeal = meals.find((m) => m.id === booking.mealPackageId) ?? meals[0]
  const selectedAddOns = extras.filter((a) => booking.addOnIds.includes(a.id))
  const estimate = estimateBooking({
    roomType,
    search: { ...search, nights },
    mealPackage: selectedMeal,
    addOns: selectedAddOns,
  })

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validateGuest(guest)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      document.getElementById(Object.keys(nextErrors)[0])?.focus()
      return
    }

    const reservation = await createReservation
      .mutateAsync({
        room_type_id: roomType.id,
        rooms: search.rooms,
        check_in: search.checkIn,
        check_out: search.checkOut,
        stay_type: search.stayType,
        num_guests: search.guests,
        meal_package_id: selectedMeal?.id ?? null,
        add_ons: selectedAddOns.map((a) => ({ id: a.id, quantity: 1 })),
        special_requests: booking.specialRequests.trim(),
        guest: {
          full_name: guest.fullName.trim(),
          email: guest.email.trim(),
          phone: guest.phone.trim(),
          company_name: guest.company.trim(),
        },
      })
      .catch(() => null)

    if (reservation) {
      booking.setReservationReference(reservation.reference)
      navigate('/book/payment')
    }
  }

  return (
    <main id="main" className="mx-auto flex max-w-6xl flex-col gap-6 px-6 pb-18 pt-8">
      <div>
        <Link to="/rooms" className="font-semibold text-brand no-underline hover:text-brand-dark">← Change room</Link>
        <h1 className="mt-2 font-display text-[40px] font-bold tracking-tight">Your booking details</h1>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-wrap items-start gap-6">
        <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-5">
          <section className="card flex flex-col gap-4 p-6" aria-labelledby="guest-heading">
            <h2 id="guest-heading" className="font-display text-xl font-bold">Lead guest</h2>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
              <TextField id="fullName" label="Full name" autoComplete="name" value={guest.fullName} error={errors.fullName} onChange={(v) => booking.updateGuest({ fullName: v })} />
              <TextField id="phone" label="Phone" type="tel" autoComplete="tel" value={guest.phone} error={errors.phone} onChange={(v) => booking.updateGuest({ phone: v })} />
              <TextField id="email" label="Email" type="email" autoComplete="email" value={guest.email} error={errors.email} onChange={(v) => booking.updateGuest({ email: v })} />
              <TextField id="company" label="Company (optional)" autoComplete="organization" value={guest.company} onChange={(v) => booking.updateGuest({ company: v })} />
            </div>
          </section>

          <section className="card flex flex-col gap-4 p-6" aria-labelledby="meal-heading">
            <h2 id="meal-heading" className="font-display text-xl font-bold">Meal package</h2>
            {mealPackages.isError ? (
              <Alert tone="error">{getErrorMessage(mealPackages.error)}</Alert>
            ) : (
              <div role="radiogroup" aria-labelledby="meal-heading" className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
                {meals.map((meal) => {
                  const checked = selectedMeal?.id === meal.id
                  const free = Number(meal.price_per_guest_per_day) === 0
                  return (
                    <button
                      key={meal.id}
                      type="button"
                      role="radio"
                      aria-checked={checked}
                      onClick={() => booking.setMealPackage(meal.id)}
                      className={`rounded-xl border-2 p-4 text-left ${checked ? 'border-brand bg-brand-soft' : 'border-line bg-white'}`}
                    >
                      <span className="block font-bold">{meal.name}</span>
                      <span className="block text-sm text-muted">{meal.description}</span>
                      <span className="mt-2 block text-sm font-bold">
                        {free ? 'Included' : `${formatMoney(meal.price_per_guest_per_day)} / guest / day`}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </section>

          <section className="card flex flex-col gap-3 p-6" aria-labelledby="extras-heading">
            <h2 id="extras-heading" className="font-display text-xl font-bold">Extra services</h2>
            {addOns.isError && <Alert tone="error">{getErrorMessage(addOns.error)}</Alert>}
            {extras.map((addOn) => (
              <label key={addOn.id} className="flex min-h-14 cursor-pointer items-center gap-3.5 rounded-xl border border-line px-3.5 py-2">
                <input
                  type="checkbox"
                  checked={booking.addOnIds.includes(addOn.id)}
                  onChange={() => booking.toggleAddOn(addOn.id)}
                  className="size-5 accent-brand"
                />
                <span className="flex-auto">
                  <span className="block font-bold">{addOn.name}</span>
                  <span className="block text-sm text-muted">{addOn.description}</span>
                </span>
                <span className="text-sm font-bold">
                  {formatMoney(addOn.price)} {describeAddOnPrice(addOn)}
                </span>
              </label>
            ))}
          </section>

          <section className="card flex flex-col gap-2 p-6">
            <label htmlFor="requests" className="font-display text-xl font-bold">Special requests</label>
            <p id="requests-hint" className="text-sm text-muted">Arrival time, accessibility needs, room preferences. We’ll pass these to the team.</p>
            <textarea
              id="requests"
              rows={4}
              maxLength={1000}
              aria-describedby="requests-hint"
              value={booking.specialRequests}
              onChange={(e) => booking.setSpecialRequests(e.target.value)}
              className="resize-y rounded-[10px] border border-field p-3"
            />
          </section>
        </div>

        <aside aria-label="Booking summary" className="card flex flex-[1_1_320px] flex-col gap-4 p-6">
          <h2 className="font-display text-xl font-bold">Summary</h2>
          <div className="flex flex-col gap-1 border-b border-line pb-4">
            <span className="font-bold">
              {roomType.name}{search.rooms > 1 ? ` × ${search.rooms}` : ''}
            </span>
            <span className="text-sm text-muted">
              {formatDate(search.checkIn)} → {formatDate(search.checkOut)} · {plural(search.guests, 'guest')}
            </span>
          </div>
          <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-2.5 text-[15px]">
            <dt className="text-muted">Room · {plural(nights, 'night')}</dt>
            <dd className="font-semibold">{formatMoney(estimate.room)}</dd>
            <dt className="text-muted">Meals · {selectedMeal?.name ?? '—'}</dt>
            <dd className="font-semibold">{formatMoney(estimate.meals)}</dd>
            <dt className="text-muted">Extras · {selectedAddOns.length} selected</dt>
            <dd className="font-semibold">{formatMoney(estimate.extras)}</dd>
          </dl>
          <div className="flex items-baseline justify-between border-t border-line pt-4">
            <span className="font-bold">Estimated total</span>
            <span className="font-display text-[28px] font-bold">{formatMoney(estimate.subtotal)}</span>
          </div>
          <p className="-mt-2 text-sm text-muted">Before tax. Your invoice shows the final amount.</p>

          {createReservation.isError && (
            <Alert tone="error">{getErrorMessage(createReservation.error)}</Alert>
          )}

          <button type="submit" disabled={createReservation.isPending} className="btn-primary min-h-13">
            {createReservation.isPending ? 'Reserving…' : 'Reserve and get invoice'}
          </button>
          <p className="text-sm text-muted">
            Your room is held while you pay. Unpaid reservations are released automatically.
          </p>
        </aside>
      </form>
    </main>
  )
}

function TextField({ id, label, error, onChange, type = 'text', ...props }) {
  const errorId = `${id}-error`
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="field-label">{label}</label>
      <input
        id={id}
        type={type}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`field-input ${error ? 'border-error-ink' : ''}`}
        {...props}
      />
      {error && <p id={errorId} className="text-sm font-semibold text-error-ink">{error}</p>}
    </div>
  )
}
