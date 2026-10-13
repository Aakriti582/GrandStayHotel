import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

/**
 * The booking the guest is assembling, before and after it becomes a
 * reservation. Server data (availability, the reservation itself) lives in
 * TanStack Query; this store only holds the guest's choices and the
 * reservation reference. Session storage keeps it across a page refresh.
 */
const initialState = {
  search: null, // { checkIn, checkOut, guests, rooms, stayType }
  roomType: null, // { id, name, nightly_rate, ... } snapshot for display only
  mealPackageId: null,
  addOnIds: [],
  guest: { fullName: '', email: '', phone: '', company: '' },
  specialRequests: '',
  reservationReference: null,
}

export const useBookingStore = create(
  persist(
    (set) => ({
      ...initialState,

      setSearch: (search) => set({ search }),
      selectRoomType: (roomType) => set({ roomType, reservationReference: null }),
      setMealPackage: (mealPackageId) => set({ mealPackageId }),
      toggleAddOn: (id) =>
        set((state) => ({
          addOnIds: state.addOnIds.includes(id)
            ? state.addOnIds.filter((existing) => existing !== id)
            : [...state.addOnIds, id],
        })),
      updateGuest: (fields) => set((state) => ({ guest: { ...state.guest, ...fields } })),
      setSpecialRequests: (specialRequests) => set({ specialRequests }),
      setReservationReference: (reservationReference) => set({ reservationReference }),
      reset: () => set(initialState),
    }),
    {
      name: 'grandstay.booking',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
)
