/**
 * Booking endpoints. While the Django API is being built, set
 * VITE_USE_MOCKS=true (the default) to use the in-browser mock instead.
 * Both implementations take and return the same shapes.
 */
import { apiClient } from '@/lib/apiClient'
import * as mock from '@/mocks/mockBookingApi'

const useMocks = (import.meta.env.VITE_USE_MOCKS ?? 'true') === 'true'

const http = {
  async searchAvailability({ checkIn, checkOut, guests, rooms, stayType }) {
    const { data } = await apiClient.get('/rooms/availability/', {
      params: { check_in: checkIn, check_out: checkOut, guests, rooms, stay_type: stayType },
    })
    return data
  },
  async listMealPackages() {
    const { data } = await apiClient.get('/catalog/meal-packages/')
    return data
  },
  async listAddOns() {
    const { data } = await apiClient.get('/catalog/add-ons/')
    return data
  },
  async createReservation(payload) {
    const { data } = await apiClient.post('/reservations/', payload)
    return data
  },
  async getReservation(reference) {
    const { data } = await apiClient.get(`/reservations/${reference}/`)
    return data
  },
  async payReservation(reference, body) {
    const { data } = await apiClient.post(`/reservations/${reference}/pay/`, body)
    return data
  },
}

export const bookingApi = useMocks ? mock : http
