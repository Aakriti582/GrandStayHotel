import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAvailability } from '@/api/queries'
import RoomTypeCard from '@/components/booking/RoomTypeCard'
import Alert from '@/components/ui/Alert'
import { getErrorMessage } from '@/lib/apiClient'
import { formatDate, nightsBetween, plural, todayISO } from '@/lib/format'
import { useBookingStore } from '@/store/bookingStore'

// Only nightly stays are live in milestone 1; the others ship later.
const stayTypes = [
  { id: 'DAY', label: 'Nightly', unit: 'night', enabled: true },
  { id: 'HOUR', label: 'Hourly', unit: 'hour', enabled: false },
  { id: 'WEEK', label: 'Weekly', unit: 'week', enabled: false },
  { id: 'MONTH', label: 'Monthly', unit: 'month', enabled: false },
]

export default function SearchPage() {
  const navigate = useNavigate()
  const savedSearch = useBookingStore((s) => s.search)
  const setSearch = useBookingStore((s) => s.setSearch)
  const selectRoomType = useBookingStore((s) => s.selectRoomType)

  const [form, setForm] = useState(
    () =>
      savedSearch ?? {
        checkIn: todayISO(1),
        checkOut: todayISO(3),
        guests: 2,
        rooms: 1,
        stayType: 'DAY',
      },
  )
  const [formError, setFormError] = useState('')
  const availability = useAvailability(savedSearch)

  const update = (field) => (event) => {
    const value = event.target.type === 'number' || event.target.tagName === 'SELECT' ? Number(event.target.value) : event.target.value
    setForm((current) => ({ ...current, [field]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (form.checkIn < todayISO()) return setFormError('Check-in can’t be in the past.')
    if (nightsBetween(form.checkIn, form.checkOut) < 1) return setFormError('Check-out must be after check-in.')
    if (form.guests < form.rooms) return setFormError('Each room needs at least one guest.')
    setFormError('')
    setSearch({ ...form })
  }

  function handleSelect(roomType) {
    selectRoomType(roomType)
    navigate('/book/details')
  }

  const unit = stayTypes.find((t) => t.id === form.stayType)?.unit ?? 'night'

  return (
    <>
      <section className="bg-ink text-ground">
        <div className="mx-auto max-w-6xl px-6 pb-24 pt-14">
          <p className="mb-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-mint">Book direct</p>
          <h1 className="max-w-3xl font-display text-[clamp(36px,5vw,60px)] font-bold leading-[1.05] tracking-tight">
            Find a room for your dates
          </h1>
          <p className="mt-4 max-w-xl text-lg text-[#c9d3cf]">
            Stay by the night, with hourly, weekly and monthly stays coming soon. Your room is held while you complete payment.
          </p>
        </div>
      </section>

      <div className="mx-auto -mt-16 max-w-6xl px-6">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="card flex flex-col gap-5 p-6 shadow-[0_12px_32px_rgba(20,32,28,0.08)]"
        >
          <fieldset className="flex flex-wrap gap-2">
            <legend className="mb-2.5 text-sm font-bold">Stay type</legend>
            {stayTypes.map((type) => {
              const active = form.stayType === type.id
              return (
                <button
                  key={type.id}
                  type="button"
                  aria-pressed={active}
                  disabled={!type.enabled}
                  onClick={() => setForm((current) => ({ ...current, stayType: type.id }))}
                  className={`min-h-11 rounded-full border px-4.5 font-bold disabled:cursor-not-allowed disabled:text-muted ${
                    active ? 'border-brand bg-brand text-white' : 'border-field bg-white text-ink'
                  }`}
                >
                  {type.label}
                  {!type.enabled && <span className="ml-1.5 text-xs font-semibold">Soon</span>}
                </button>
              )
            })}
          </fieldset>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] items-end gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="checkin" className="field-label">Check-in</label>
              <input id="checkin" type="date" min={todayISO()} value={form.checkIn} onChange={update('checkIn')} className="field-input" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="checkout" className="field-label">Check-out</label>
              <input id="checkout" type="date" min={form.checkIn} value={form.checkOut} onChange={update('checkOut')} className="field-input" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="guests" className="field-label">Guests</label>
              <select id="guests" value={form.guests} onChange={update('guests')} className="field-input">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <option key={n} value={n}>{plural(n, 'guest')}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="rooms" className="field-label">Rooms</label>
              <select id="rooms" value={form.rooms} onChange={update('rooms')} className="field-input">
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>{plural(n, 'room')}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-primary h-12">Search availability</button>
          </div>

          {formError && <Alert tone="error">{formError}</Alert>}
        </form>
      </div>

      <main id="main" className="mx-auto flex max-w-6xl flex-col gap-5 px-6 pb-18 pt-10">
        <SearchResults
          search={savedSearch}
          availability={availability}
          unit={unit}
          onSelect={handleSelect}
        />
      </main>
    </>
  )
}

function SearchResults({ search, availability, unit, onSelect }) {
  if (!search) {
    return (
      <p className="text-muted">Choose your dates and search to see which rooms are free.</p>
    )
  }

  const { data: roomTypes, isPending, isError, error } = availability

  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-display text-3xl font-bold tracking-tight">Available room types</h2>
        <p className="text-muted">
          {formatDate(search.checkIn)} → {formatDate(search.checkOut)} · {plural(search.guests, 'guest')} · prices per {unit}
        </p>
      </div>

      {isPending && (
        <div aria-busy="true" aria-label="Loading rooms" className="flex flex-col gap-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card h-50 animate-pulse bg-chip" />
          ))}
        </div>
      )}

      {isError && <Alert tone="error">{getErrorMessage(error)}</Alert>}

      {roomTypes?.length === 0 && (
        <Alert tone="info">
          Nothing is free for {plural(search.guests, 'guest')} in {plural(search.rooms, 'room')} on those dates. Try different dates or fewer guests per room.
        </Alert>
      )}

      {roomTypes?.map((roomType) => (
        <RoomTypeCard
          key={roomType.id}
          roomType={roomType}
          roomsRequested={search.rooms}
          unit={unit}
          onSelect={() => onSelect(roomType)}
        />
      ))}
    </>
  )
}
