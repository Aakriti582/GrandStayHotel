import { Navigate, Route, Routes } from 'react-router-dom'
import SiteLayout from '@/components/layout/SiteLayout'
import ConfirmedPage from '@/pages/booking/ConfirmedPage'
import DetailsPage from '@/pages/booking/DetailsPage'
import PaymentPage from '@/pages/booking/PaymentPage'
import SearchPage from '@/pages/booking/SearchPage'
import NotFoundPage from '@/pages/NotFoundPage'

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<Navigate to="/rooms" replace />} />
        <Route path="rooms" element={<SearchPage />} />
        <Route path="book/details" element={<DetailsPage />} />
        <Route path="book/payment" element={<PaymentPage />} />
        <Route path="book/confirmed" element={<ConfirmedPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
