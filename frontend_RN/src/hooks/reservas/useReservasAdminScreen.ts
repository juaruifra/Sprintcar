import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Reservation } from '../../services/vehicles/reservationsService';
import { useAdminReservations } from './useAdminReservations';
import { useCancelReservation } from './useCancelReservation';
import { useSnackbar } from '../useSnackbar';

/**
 * Hook de pantalla de reservas para administrador.
 *
 * Centraliza filtros, búsqueda y acciones para que
 * el componente quede centrado en pintar UI.
 */
export function useReservasAdminScreen() {
  const { t } = useTranslation();
  const reservationsQuery = useAdminReservations();
  const cancelReservationMutation = useCancelReservation();
  const { showSuccess, showError, SnackbarUI } = useSnackbar();

  const [statusFilter, setStatusFilter] = useState<'all' | 'CREADA' | 'CANCELADA'>('all');
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
    cancelReservationMutation.mutate(reservationId, {
      onSuccess: () => showSuccess(t('reservations.cancelSuccess')),
      onError: (error) => showError(error instanceof Error ? error.message : t('common.unexpectedError')),
    });
  };

  return {
    reservationsQuery,
    cancelReservationMutation,
    SnackbarUI,
    statusFilter,
    setStatusFilter,
    search,
    setSearch,
    reservations,
    getUserDisplayName,
    handleCancelReservation,
  };
}
