import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMyIncidents } from './useMyIncidents';
import { useIncidentActions } from './useIncidentActions';
import { useMyReservations } from '../reservas/useMyReservations';
import { useSnackbar } from '../useSnackbar';

export function useIncidentsUserScreen() {
  const { t } = useTranslation();
  const myIncidentsQuery = useMyIncidents();
  const myReservationsQuery = useMyReservations();
  const { createMutation } = useIncidentActions();
  const { showSuccess, showError, SnackbarUI } = useSnackbar();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedReservationId, setSelectedReservationId] = useState<number | null>(null);
  const [description, setDescription] = useState('');

  const openModal = () => {
    setSelectedReservationId(null);
    setDescription('');
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
      { reservationId: selectedReservationId, description: description.trim() },
      {
        onSuccess: () => {
          // Cerramos el modal primero para que el usuario vea la lista actualizada.
          closeModal();
          showSuccess(t('incidents.createSuccess'));
          // La invalidación ya ocurrió en useIncidentActions.onSuccess antes de llegar aquí.
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
    handleSubmit,
    isSubmitting: createMutation.isPending,
    SnackbarUI,
  };
}
