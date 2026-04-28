import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMyIncidents } from './useMyIncidents';
import { useIncidentActions } from './useIncidentActions';
import { useMyReservations } from '../reservas/useMyReservations';
import { useSnackbar } from '../useSnackbar';
import { IncidentPriority, IncidentStatus } from '../../services/incidents/incidentsService';

// Los mismos filtros que en admin, pero sin "todo" — el usuario ve sus propias.
export const USER_INCIDENT_FILTERS: Array<'all' | IncidentStatus> = [
  'ABIERTA',
  'RESUELTA',
  'all',
];

export function useIncidentsUserScreen() {
  const { t } = useTranslation();
  const { createMutation } = useIncidentActions();
  const myReservationsQuery = useMyReservations();
  const { showSuccess, showError, SnackbarUI } = useSnackbar();

  // Paginación: 5 incidencias por página.
  const [page, setPage] = useState(1);
  const limit = 5;

  // Filtro de estado: por defecto ABIERTA, igual que en la vista admin.
  const [statusFilter, setStatusFilter] = useState<'all' | IncidentStatus>('ABIERTA');

  // Cambiar el filtro resetea la página para no quedar en una inexistente.
  const changeStatusFilter = (next: 'all' | IncidentStatus) => {
    setStatusFilter(next);
    setPage(1);
  };

  // Solo pasamos status al hook cuando es un valor concreto (no "all").
  const myIncidentsQuery = useMyIncidents({
    page,
    limit,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  // Avanzar/retroceder página protegiendo los límites.
  const nextPage = () => {
    if (myIncidentsQuery.data && page < myIncidentsQuery.data.totalPages) {
      setPage((p) => p + 1);
    }
  };
  const prevPage = () => {
    if (page > 1) setPage((p) => p - 1);
  };

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedReservationId, setSelectedReservationId] = useState<number | null>(null);
  const [description, setDescription] = useState('');
  // Por defecto sugiere prioridad media, que es la más común.
  const [priority, setPriority] = useState<IncidentPriority>('MEDIA');

  const openModal = () => {
    setSelectedReservationId(null);
    setDescription('');
    setPriority('MEDIA');
    setIsModalVisible(true);
  };

  const closeModal = () => setIsModalVisible(false);

  const handleSubmit = () => {
    if (!selectedReservationId) {
      showError(t('incidents.validationSelectReservation'));
      return;
    }
    if (description.trim().length < 10) {
      showError(t('incidents.validationDescriptionMin'));
      return;
    }

    createMutation.mutate(
      { reservationId: selectedReservationId, description: description.trim(), priority },
      {
        onSuccess: () => {
          // Cerramos el modal y volvemos a la primera página para ver la nueva incidencia.
          closeModal();
          setPage(1);
          showSuccess(t('incidents.createSuccess'));
        },
        onError: (error) =>
          showError(error instanceof Error ? error.message : t('common.unexpectedError')),
      },
    );
  };

  // Solo reservas CONFIRMADAS o FINALIZADAS permiten reportar incidencia.
  const reportableReservations = (myReservationsQuery.data ?? []).filter(
    (r) => r.status === 'CONFIRMADA' || r.status === 'FINALIZADA',
  );

  return {
    myIncidentsQuery,
    incidents: myIncidentsQuery.data?.items ?? [],
    page,
    limit,
    nextPage,
    prevPage,
    statusFilter,
    changeStatusFilter,
    reportableReservations,
    isModalVisible,
    openModal,
    closeModal,
    selectedReservationId,
    setSelectedReservationId,
    description,
    setDescription,
    priority,
    setPriority,
    handleSubmit,
    isSubmitting: createMutation.isPending,
    SnackbarUI,
  };
}
