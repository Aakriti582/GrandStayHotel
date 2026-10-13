import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { usePayReservation, useReservation } from '@/api/queries'
import InvoiceTable from '@/components/booking/InvoiceTable'
import Alert from '@/components/ui/Alert'
import { formatClock, useCountdown } from '@/hooks/useCountdown'
import { getErrorMessage } from '@/lib/apiClient'
import { formatDate, formatDateTime, formatMoney } from '@/lib/format'
import { useBookingStore } from '@/store/bookingStore'

const methods = [
  { id: 'CARD', label: 'Credit or debit card' },
  { id: 'ONLINE_BANKING', label: 'Online banking' },
  { id: 'E_WALLET', label: 'E-wallet' },
]

const ClockIcon = (
  <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" className="flex-none">
    <circle cx="12" cy="13" r="8" fill="none" stroke="currentColor" strokeWidth="1.8" />
    <path d="M12 9v4l2.5 2M9 3h6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)

export default function PaymentPage() {
  const navigate = useNavigate()
  const reference = useBookingStore((s) => s.reservationReference)
  const { data: reservation, isPending, isError, error, refetch } = useReservation(reference)
  const pay = usePayReservation(reference)
  const [method, setMethod] = useState('CARD')
  const secondsLeft = useCountdown(reservation?.payment_deadline)

  // When the hold runs out, ask the server for the real status rather than guessing.
  const holdElapsed = secondsLeft === 0 && reservation?.status === 'PENDING_PAYMENT'
  useEffect(() => {
    if (holdElapsed) refetch()
  }, [holdElapsed, refetch])

  if (!reference) return <Navigate to="/rooms" replace />
  if (reservation?.status === 'CONFIRMED') return <Navigate to="/book/confirmed" replace />

  async function handlePay(event) {
    event.preventDefault()
    // Card details go to the payment provider's own form, never our API.
    const result = await pay.mutateAsync({ method }).catch(() => null)
    if (result) navigate('/book/confirmed')
  }

  return (
    <main id="main" className="mx-auto flex max-w-6xl flex-col gap-6 px-6 pb-18 pt-8">
      {isPending && <div aria-busy="true" aria-label="Loading invoice" className="card h-96 animate-pulse bg-chip" />}
      {isError && <Alert tone="error">{getErrorMessage(error)}</Alert>}

      {reservation?.status === 'EXPIRED' && (
        <section className="card flex flex-col items-start gap-4 p-8">
          <h1 className="font-display text-3xl font-bold">This reservation expired</h1>
          <p className="text-muted">
            Payment wasn’t completed in time, so the room was released. Nothing was charged.
          </p>
          <Link to="/rooms" className="btn-primary no-underline">Search again</Link>
        </section>
      )}

      {reservation?.status === 'PENDING_PAYMENT' && (
        <>
          <Alert tone="warning" title="Your room is on hold." icon={ClockIcon} live="off">
            Pay within <strong className="tabular-nums">{formatClock(secondsLeft)}</strong> or the reservation will be cancelled and the room released.
          </Alert>

          <div className="flex flex-wrap items-start gap-6">
            <section aria-labelledby="inv-title" className="card flex min-w-0 flex-[999_1_560px] flex-col gap-5 p-7">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[13px] font-bold uppercase tracking-[0.08em] text-muted">Provisional invoice</p>
                  <h1 id="inv-title" className="mt-1 font-display text-[34px] font-bold tracking-tight">{reservation.reference}</h1>
                </div>
                <span className="rounded-full bg-warn-bg px-3 py-1.5 text-sm font-bold text-warn-ink">Awaiting payment</span>
              </div>

              <dl className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-4 rounded-xl bg-ground p-4">
                <div><dt className="text-[13px] text-muted">Guest</dt><dd className="font-bold">{reservation.guest.full_name}</dd></div>
                <div><dt className="text-[13px] text-muted">Stay</dt><dd className="font-bold">{formatDate(reservation.check_in)} → {formatDate(reservation.check_out)}</dd></div>
                <div><dt className="text-[13px] text-muted">Due by</dt><dd className="font-bold">{formatDateTime(reservation.payment_deadline)}</dd></div>
              </dl>

              <InvoiceTable invoice={reservation.invoice} />
            </section>

            <form onSubmit={handlePay} aria-labelledby="pay-title" className="card flex flex-[1_1_340px] flex-col gap-4 p-6">
              <h2 id="pay-title" className="font-display text-[22px] font-bold">Pay now</h2>
              <div role="radiogroup" aria-labelledby="pay-title" className="flex flex-col gap-2">
                {methods.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    role="radio"
                    aria-checked={method === m.id}
                    onClick={() => setMethod(m.id)}
                    className={`min-h-12 rounded-[10px] border-2 px-4 text-left font-bold ${
                      method === m.id ? 'border-brand bg-brand-soft' : 'border-line bg-white'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              <p className="rounded-[10px] bg-ground p-3.5 text-sm text-muted">
                {method === 'CARD'
                  ? 'You’ll enter your card details on the payment provider’s secure form.'
                  : 'You’ll be sent to your provider to approve the payment, then brought back here.'}
              </p>

              {pay.isError && <Alert tone="error">{getErrorMessage(pay.error)}</Alert>}

              <button type="submit" disabled={pay.isPending || secondsLeft === 0} className="btn-primary min-h-13">
                {pay.isPending ? 'Processing payment…' : `Pay ${formatMoney(reservation.invoice.total)}`}
              </button>
              <Link to="/book/details" className="text-center text-sm font-semibold text-brand">Edit booking</Link>
            </form>
          </div>
        </>
      )}
    </main>
  )
}
