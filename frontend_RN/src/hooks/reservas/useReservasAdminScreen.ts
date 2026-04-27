import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Reservation, ReservationStatus } from '../../services/vehicles/reservationsService';
import { useAdminReservations } from './useAdminReservations';
import { useAdminReservationActions } from './useAdminReservationActions';
import { useSnackbar } from '../useSnackbar';

export const ADMIN_STATUS_FILTERS: Array<'all' | ReservationStatus> = [
  'CREADA',
  'CONFIRMADA',
  'RECHAZADA',
  'CANCELADA',
  'FINALIZADA',
  'all',
];

/**
 * Hook de pantalla de reservas para administrador.
 *
 * Centraliza filtros, búsqueda y acciones para que
 * el componente quede centrado en pintar UI.
 */
export function useReservasAdminScreen() {
  const { t } = useTranslation();
  const { confirmMutation, rejectMutation, cancelMutation } = useAdminReservationActions();
  const { showSuccess, showError, SnackbarUI } = useSnackbar();

  // Pendientes (CREADA) por defecto para priorizar trabajo operativo.
  const [statusFilter, setStatusFilter] = useState<'all' | ReservationStatus>('CREADA');
  const [searchDraft, setSearchDraft] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const reservationsQuery = useAdminReservations({
    status: statusFilter,
    search,
    page,
    limit,
  });

  const getUserDisplayName = (item: Reservation) => {
    const firstName = item.user?.name?.trim() ?? '';
    const lastName = item.user?.lastName?.trim() ?? '';
    const fullName = `${firstName} ${lastName}`.trim();

    if (fullName) {
      return fullName;
    }

    return item.user?.email ?? t('reservations.unknownUser');
  };

  const reservations = useMemo(() => reservationsQuery.data?.items ?? [], [reservationsQuery.data]);
  const counts = useMemo(() => reservationsQuery.data?.counts, [reservationsQuery.data]);

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

  const applySearch = () => {
    setPage(1);
    setSearch(searchDraft);
  };

  const changeStatusFilter = (next: 'all' | ReservationStatus) => {
    setStatusFilter(next);
    setPage(1);
  };

  const nextPage = () => {
    if (reservationsQuery.data && page < reservationsQuery.data.totalPages) {
      setPage((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  return {
    reservationsQuery,
    confirmMutation,
    rejectMutation,
    cancelMutation,
    isAnyStatusActionPending,
    SnackbarUI,
    statusFilter,
    changeStatusFilter,
    counts,
    page,
    limit,
    nextPage,
    prevPage,
    searchDraft,
    setSearchDraft,
    applySearch,
    reservations,
    getUserDisplayName,
    handleConfirmReservation,
    handleRejectReservation,
    handleCancelReservation,
  };
}
