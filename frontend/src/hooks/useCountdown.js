import { useEffect, useState } from 'react'

/** Seconds remaining until `deadline` (an ISO string), ticking once a second. */
export function useCountdown(deadline) {
  const target = deadline ? new Date(deadline).getTime() : null
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!target) return undefined
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [target])

  if (!target) return null
  return Math.max(0, Math.floor((target - now) / 1000))
}

export function formatClock(totalSeconds) {
  if (totalSeconds === null) return '—'
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}
