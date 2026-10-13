import { formatMoney } from '@/lib/format'

const LOW_STOCK_THRESHOLD = 3

export default function RoomTypeCard({ roomType, roomsRequested, unit, onSelect }) {
  const lowStock = roomType.available_count <= LOW_STOCK_THRESHOLD

  return (
    <article className="card flex flex-wrap overflow-hidden">
      <div
        role="img"
        aria-label={`${roomType.name} photo placeholder`}
        className="flex min-h-50 flex-[1_1_280px] items-center justify-center bg-[repeating-linear-gradient(135deg,#e3eeea_0_12px,#d6e5df_12px_24px)] font-semibold text-brand"
      >
        Room photo
      </div>
      <div className="flex flex-[999_1_420px] flex-wrap justify-between gap-6 p-6">
        <div className="flex min-w-60 flex-[1_1_320px] flex-col gap-2.5">
          <h3 className="font-display text-2xl font-bold">{roomType.name}</h3>
          <p className="text-muted">{roomType.description}</p>
          <ul className="flex flex-wrap gap-2">
            <li className="rounded-full bg-chip px-2.5 py-1 text-sm font-semibold">Sleeps {roomType.max_occupancy}</li>
            <li className="rounded-full bg-chip px-2.5 py-1 text-sm font-semibold">{roomType.bed}</li>
          </ul>
        </div>
        <div className="flex min-w-50 flex-col items-end justify-between gap-3">
          <div className="text-right">
            <div className="font-display text-[26px] font-bold">{formatMoney(roomType.nightly_rate)}</div>
            <div className="text-sm text-muted">per {unit}{roomsRequested > 1 ? ', per room' : ''}</div>
          </div>
          <div className={`text-sm font-semibold ${lowStock ? 'text-amber' : 'text-brand'}`}>
            {lowStock ? `Only ${roomType.available_count} left for these dates` : 'Available'}
          </div>
          <button type="button" onClick={onSelect} className="btn-primary">
            Select room
            <span className="sr-only">: {roomType.name}</span>
          </button>
        </div>
      </div>
    </article>
  )
}
