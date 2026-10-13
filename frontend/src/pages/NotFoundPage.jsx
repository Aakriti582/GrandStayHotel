import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <main id="main" className="mx-auto flex max-w-xl flex-col items-start gap-4 px-6 py-20">
      <p className="text-[13px] font-bold uppercase tracking-[0.08em] text-muted">Not built yet</p>
      <h1 className="font-display text-4xl font-bold tracking-tight">This page isn’t here yet</h1>
      <p className="text-muted">The booking flow is the first milestone. This section comes in a later one.</p>
      <Link to="/rooms" className="btn-primary no-underline">Find a room</Link>
    </main>
  )
}
