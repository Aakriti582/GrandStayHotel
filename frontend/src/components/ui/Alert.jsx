const tones = {
  warning: 'border-warn-line bg-warn-bg text-warn-ink',
  error: 'border-error-ink/30 bg-error-bg text-error-ink',
  info: 'border-line bg-white text-ink',
}

export default function Alert({ tone = 'info', title, children, icon, live = 'polite' }) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      aria-live={tone === 'error' ? undefined : live}
      className={`flex flex-wrap items-center gap-3.5 rounded-xl border px-5 py-4 ${tones[tone]}`}
    >
      {icon}
      <p className="m-0 min-w-0 flex-[1_1_320px]">
        {title && <strong>{title} </strong>}
        {children}
      </p>
    </div>
  )
}
