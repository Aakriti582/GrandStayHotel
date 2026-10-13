export default function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
        <rect x="1" y="1" width="30" height="30" rx="8" className="fill-brand" />
        <path
          d="M10 22V12l6-3 6 3v10M14 22v-5h4v5"
          fill="none"
          stroke="#fff"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
      <span className="font-display text-[22px] font-bold tracking-tight">Grand Stay</span>
    </span>
  )
}
