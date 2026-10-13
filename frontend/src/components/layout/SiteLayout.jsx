import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import BookingSteps from '@/components/booking/BookingSteps'
import Logo from '@/components/ui/Logo'

const navItems = [
  { to: '/rooms', label: 'Rooms' },
  { to: '/dining', label: 'Dining' },
  { to: '/meetings', label: 'Meetings' },
  { to: '/my-bookings', label: 'My bookings' },
]

export default function SiteLayout() {
  const { pathname } = useLocation()
  const inCheckout = pathname.startsWith('/book/')

  return (
    <div className="min-h-screen">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">
        Skip to content
      </a>
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <Link to="/rooms" className="text-ink no-underline">
            <Logo />
          </Link>
          {inCheckout ? (
            <BookingSteps pathname={pathname} />
          ) : (
            <nav aria-label="Main" className="flex flex-wrap items-center gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `rounded-[10px] px-3.5 py-2.5 font-semibold no-underline ${
                      isActive ? 'bg-brand-soft text-brand' : 'text-muted hover:text-ink'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <Link to="/sign-in" className="rounded-[10px] bg-ink px-4.5 py-2.5 font-bold text-white no-underline">
                Sign in
              </Link>
            </nav>
          )}
        </div>
      </header>
      <Outlet />
    </div>
  )
}
