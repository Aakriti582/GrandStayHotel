import { Link, Navigate } from 'react-router-dom'
import { useReservation } from '@/api/queries'
import Alert from '@/components/ui/Alert'
import { getErrorMessage } from '@/lib/apiClient'
import { formatDate, formatMoney } from '@/lib/format'
import { useBookingStore } from '@/store/bookingStore'

export default function ConfirmedPage() {
  const reference = useBookingStore((s) => s.reservationReference)
  const reset = useBookingStore((s) => s.reset)
  const { data: reservation, isPending, isError, error } = useReservation(reference)

  if (!reference) return <Navigate to="/rooms" replace />
  if (reservation && reservation.status !== 'CONFIRMED') return <Navigate to="/book/payment" replace />

  return (
    <main id="main" className="mx-auto flex max-w-[880px] flex-col gap-6 px-6 pb-18 pt-12">
      {isPending && <div aria-busy="true" aria-label="Loading booking" className="h-80 animate-pulse rounded-[22px] bg-chip" />}
      {isError && <Alert tone="error">{getErrorMessage(error)}</Alert>}

      {reservation && (
        <>
          <section className="flex flex-col gap-5 rounded-[22px] bg-ink p-9 text-ground">
            <div className="flex items-center gap-3.5">
              <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden="true">
                <circle cx="22" cy="22" r="21" className="fill-mint" />
                <path d="M13 22.5l6 6 12-13" fill="none" stroke="#14201c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="font-bold text-mint">Payment received</p>
            </div>
            <h1 className="font-display text-[clamp(32px,4.5vw,48px)] font-bold leading-[1.05] tracking-tight">
              Your stay is confirmed
            </h1>
            <div className="flex flex-wrap gap-4">
              <div className="flex-[1_1_200px] rounded-xl bg-ink-soft p-4.5">
                <p className="text-[13px] text-[#c9d3cf]">Booking reference</p>
                <p className="mt-1 font-display text-[26px] font-bold">{reservation.reference}</p>
              </div>
              <div className="flex-[1_1_200px] rounded-xl bg-ink-soft p-4.5">
                <p className="text-[13px] text-[#c9d3cf]">{reservation.assigned_rooms.length > 1 ? 'Your rooms' : 'Your room'}</p>
                <p className="mt-1 font-display text-[26px] font-bold">
                  {reservation.assigned_rooms.map((room) => `Room ${room.number}`).join(', ')}
                </p>
              </div>
            </div>
            <p className="text-[#c9d3cf]">
              A receipt has been sent to {reservation.guest.email}. Show your reference at the front desk on arrival.
            </p>
          </section>

          <section className="card flex flex-col gap-4 p-6" aria-labelledby="stay-heading">
            <h2 id="stay-heading" className="font-display text-xl font-bold">Stay details</h2>
            <dl className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
              <Detail label="Room type" value={reservation.room_type.name} />
              <Detail label="Check-in" value={formatDate(reservation.check_in)} />
              <Detail label="Check-out" value={formatDate(reservation.check_out)} />
              <Detail label="Guests" value={reservation.num_guests} />
              <Detail label="Meals" value={reservation.meal_package?.name ?? 'Room only'} />
              <Detail label="Extras" value={reservation.add_ons.length ? reservation.add_ons.join(', ') : 'None'} />
              <Detail label="Amount paid" value={formatMoney(reservation.invoice.total)} />
            </dl>
          </section>

          <nav aria-label="During your stay" className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3">
            <ActionLink to="/stay/requests" title="Request a service" hint="Housekeeping, catering or extra amenities" />
            <ActionLink to="/stay/meetings" title="Schedule a meeting" hint="Book time with a staff member" />
            <ActionLink to={`/my-bookings/${reservation.reference}/receipt`} title="Download receipt" hint="PDF of your paid invoice" />
          </nav>

          <Link to="/rooms" onClick={reset} className="self-start font-bold text-brand no-underline hover:text-brand-dark">
            Book another stay
          </Link>
        </>
      )}
    </main>
  )
}

function Detail({ label, value }) {
  return (
    <div>
      <dt className="text-[13px] text-muted">{label}</dt>
      <dd className="font-bold">{value}</dd>
    </div>
  )
}

function ActionLink({ to, title, hint }) {
  return (
    <Link to={to} className="card flex flex-col gap-1 p-5 text-ink no-underline hover:border-brand">
      <span className="font-bold">{title}</span>
      <span className="text-sm text-muted">{hint}</span>
    </Link>
  )
}
