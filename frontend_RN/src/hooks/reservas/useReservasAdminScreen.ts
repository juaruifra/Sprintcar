import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Reservation, ReservationStatus } from '../../services/vehicles/reservationsService';
import { useAdminReservations } from './useAdminReservations';
import { useAdminReservationActions } from './useAdminReservationActions';
import { useSnackbar } from '../useSnackbar';

export const ADMIN_STATUS_FILTERS: Array<'all' | ReservationStatus> = [
  'all',
  'CREADA',
  'CONFIRMADA',
  'RECHAZADA',
  'CANCELADA',
];

/**
 * Hook de pantalla de reservas para administrador.
 *
 * Centraliza filtros, búsqueda y acciones para que
 * el componente quede centrado en pintar UI.
 */
export function useReservasAdminScreen() {
  const { t } = useTranslation();
  const reservationsQuery = useAdminReservations();
  const { confirmMutation, rejectMutation, cancelMutation } = useAdminReservationActions();
  const { showSuccess, showError, SnackbarUI } = useSnackbar();

  const [statusFilter, setStatusFilter] = useState<'all' | ReservationStatus>('all');
  const [search, setSearch] = useState('');

  const getUserDisplayName = (item: Reservation) => {
    const firstName = item.user?.name?.trim() ?? '';
    const lastName = item.user?.lastName?.trim() ?? '';
    const fullName = `${firstName} ${lastName}`.trim();

    if (fullName) {
      return fullName;
    }

    return item.user?.email ?? t('reservations.unknownUser');
  };

  const reservations = useMemo(() => {
    const base = [...(reservationsQuery.data ?? [])];
    const normalizedSearch = search.trim().toLowerCase();

    return base.filter((item) => {
      const statusMatch = statusFilter === 'all' ? true : item.status === statusFilter;
      if (!statusMatch) return false;

      if (!normalizedSearch) return true;

      const text = `${item.id} ${item.user?.name ?? ''} ${item.user?.lastName ?? ''} ${item.user?.email ?? ''} ${item.startDate} ${item.endDate} ${item.vehicle?.brand ?? ''} ${item.vehicle?.model ?? ''} ${item.vehicle?.licensePlate ?? ''}`.toLowerCase();
      return text.includes(normalizedSearch);
    });
  }, [reservationsQuery.data, search, statusFilter]);

  const handleCancelReservation = (reservationId: number) => {
    cancelMutation.mutate(reservationId, {
      onSuccess: () => showSuccess(t('reservations.cancelSuccess')),
      onError: (error) => showError(error instanceof Error ? error.message : t('common.unexpectedError')),
    });
  };

  const handleConfirmReservation = (reservationId: number) => {
    // Confirmar cambia una reserva creada a confirmada.
    confirmMutation.mutate(reservationId, {
      onSuccess: () => showSuccess(t('reservations.confirmSuccess')),
      onError: (error) => showError(error instanceof Error ? error.message : t('common.unexpectedError')),
    });
  };

  const handleRejectReservation = (reservationId: number) => {
    // Rechazar cambia una reserva creada a rechazada.
    rejectMutation.mutate(reservationId, {
      onSuccess: () => showSuccess(t('reservations.rejectSuccess')),
      onError: (error) => showError(error instanceof Error ? error.message : t('common.unexpectedError')),
    });
  };

  const isAnyStatusActionPending =
    confirmMutation.isPending ||
    rejectMutation.isPending ||
    cancelMutation.isPending;

  return {
    reservationsQuery,
    confirmMutation,
    rejectMutation,
    cancelMutation,
    isAnyStatusActionPending,
    SnackbarUI,
    statusFilter,
    setStatusFilter,
    search,
    setSearch,
    reservations,
    getUserDisplayName,
    handleConfirmReservation,
    handleRejectReservation,
    handleCancelReservation,
  };
}
