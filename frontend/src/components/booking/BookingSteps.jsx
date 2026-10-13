const steps = [
  { path: '/rooms', label: 'Room' },
  { path: '/book/details', label: 'Details' },
  { path: '/book/payment', label: 'Payment' },
  { path: '/book/confirmed', label: 'Confirmed' },
]

export default function BookingSteps({ pathname }) {
  const currentIndex = Math.max(
    0,
    steps.findIndex((step) => pathname.startsWith(step.path)),
  )

  return (
    <ol aria-label="Booking steps" className="flex flex-wrap gap-2 text-sm font-bold">
      {steps.map((step, index) => {
        const state = index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'todo'
        const styles = {
          done: 'bg-brand-soft text-brand',
          current: 'bg-brand text-white',
          todo: 'bg-chip text-muted',
        }[state]
        return (
          <li
            key={step.path}
            aria-current={state === 'current' ? 'step' : undefined}
            className={`rounded-full px-3 py-2 ${styles}`}
          >
            {index + 1} {step.label}
            {state === 'done' && <span className="sr-only"> (completed)</span>}
          </li>
        )
      })}
    </ol>
  )
}
