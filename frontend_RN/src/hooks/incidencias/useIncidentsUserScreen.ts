import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMyIncidents } from './useMyIncidents';
import { useIncidentActions } from './useIncidentActions';
import { useMyReservations } from '../reservas/useMyReservations';
import { useSnackbar } from '../useSnackbar';
import { IncidentPriority } from '../../services/incidents/incidentsService';

export function useIncidentsUserScreen() {
  const { t } = useTranslation();
  const myIncidentsQuery = useMyIncidents();
  const myReservationsQuery = useMyReservations();
  const { createMutation } = useIncidentActions();
  const { showSuccess, showError, SnackbarUI } = useSnackbar();

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
          // Cerramos el modal primero para que el usuario vea la lista actualizada.
          closeModal();
          showSuccess(t('incidents.createSuccess'));
        },
        onError: (error) =>
          showError(error instanceof Error ? error.message : t('common.unexpectedError')),
      },
    );
  };

  // Solo se puede reportar incidencia sobre reservas CONFIRMADAS o FINALIZADAS.
  const reportableReservations = (myReservationsQuery.data ?? []).filter(
    (r) => r.status === 'CONFIRMADA' || r.status === 'FINALIZADA',
  );

  return {
    myIncidentsQuery,
    incidents: myIncidentsQuery.data ?? [],
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
