# Grand Stay Hotel Management System

A hotel booking and operations platform: guests book rooms and pay online, staff receive tasks when bookings are confirmed, vendors are approved and billed monthly, and managers see reports.

## Repository layout

| Folder | What it is |
| --- | --- |
| `frontend/` | React 19 + Vite + Tailwind CSS v4 guest app |
| `backend/` | Django + DRF + PostgreSQL API (coming next) |

## Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

The app runs at http://localhost:5173. With `VITE_USE_MOCKS=true` (the default) it uses an in-browser mock API, so the whole booking flow works before the backend exists. Set it to `false` once Django is running on port 8000; Vite proxies `/api` to it.

### Milestone 1: guest booking flow

1. **Search** (`/rooms`): dates, guests and rooms, then available room types.
2. **Details** (`/book/details`): lead guest, meal package, extras and special requests, with a live price estimate.
3. **Payment** (`/book/payment`): the provisional invoice and a countdown for the payment hold. Unpaid reservations expire.
4. **Confirmed** (`/book/confirmed`): booking reference and assigned room.

### Structure

```
src/
  api/          bookingApi.js (real or mock), queries.js (TanStack Query hooks)
  components/   layout, booking and ui components
  hooks/        useCountdown
  lib/          apiClient (Axios), format, pricing
  mocks/        fixtures and the mock booking API
  pages/        one component per route
  store/        bookingStore (Zustand, persisted to sessionStorage)
```

Server data lives in TanStack Query; the Zustand store holds only the guest's choices and the reservation reference. Money is handled as decimal strings from the API and formatted only for display.

### API the frontend expects

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/rooms/availability/?check_in&check_out&guests&rooms&stay_type` | Available room types |
| GET | `/api/catalog/meal-packages/` | Meal packages |
| GET | `/api/catalog/add-ons/` | Extra services |
| POST | `/api/reservations/` | Create a reservation and provisional invoice |
| GET | `/api/reservations/{reference}/` | Reservation with invoice |
| POST | `/api/reservations/{reference}/pay/` | Pay and confirm |

Response shapes match `src/mocks/fixtures.js` and `src/mocks/mockBookingApi.js`.
