import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { bookingApi } from './bookingApi'

export const queryKeys = {
  availability: (search) => ['availability', search],
  mealPackages: ['meal-packages'],
  addOns: ['add-ons'],
  reservation: (reference) => ['reservation', reference],
}

export function useAvailability(search) {
  return useQuery({
    queryKey: queryKeys.availability(search),
    queryFn: () => bookingApi.searchAvailability(search),
    enabled: Boolean(search),
  })
}

export function useMealPackages() {
  return useQuery({ queryKey: queryKeys.mealPackages, queryFn: bookingApi.listMealPackages, staleTime: Infinity })
}

export function useAddOns() {
  return useQuery({ queryKey: queryKeys.addOns, queryFn: bookingApi.listAddOns, staleTime: Infinity })
}

export function useReservation(reference) {
  return useQuery({
    queryKey: queryKeys.reservation(reference),
    queryFn: () => bookingApi.getReservation(reference),
    enabled: Boolean(reference),
  })
}

export function useCreateReservation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: bookingApi.createReservation,
    onSuccess: (reservation) => {
      queryClient.setQueryData(queryKeys.reservation(reservation.reference), reservation)
    },
  })
}

export function usePayReservation(reference) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body) => bookingApi.payReservation(reference, body),
    onSuccess: (reservation) => {
      queryClient.setQueryData(queryKeys.reservation(reference), reservation)
    },
    onError: () => {
      // The reservation may have expired; refetch so the page shows its real state.
      queryClient.invalidateQueries({ queryKey: queryKeys.reservation(reference) })
    },
  })
}
