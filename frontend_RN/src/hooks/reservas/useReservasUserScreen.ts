import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserStore } from '../../store/userStore';
import { useMyReservations } from './useMyReservations';
import { useCreateReservation } from './useCreateReservation';
import { useCancelReservation } from './useCancelReservation';
import { useAvailableVehicles } from '../vehiculos/useAvailableVehicles';
import { useSnackbar } from '../useSnackbar';
import { validateCreateReservationPayload } from '../../utils/reservationValidation';

function formatBusinessDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function addDays(base: Date, days: number): Date {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next;
}

function parseBusinessDate(value: string): Date | null {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const parsed = new Date(year, month - 1, day);

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return parsed;
}

/**
 * Hook de pantalla de reservas de usuario.
 *
 * Aquí vive toda la lógica: estado del modal, filtros,
 * validaciones y llamadas a backend.
 */
export function useReservasUserScreen() {
  const { t } = useTranslation();
  const user = useUserStore((state) => state.user);

  const myReservationsQuery = useMyReservations();
  const createReservationMutation = useCreateReservation();
  const cancelReservationMutation = useCancelReservation();
  const { showSuccess, showError, SnackbarUI } = useSnackbar();

  // Estado local del formulario/modal de creación.
  const today = useMemo(() => new Date(), []);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [startDate, setStartDate] = useState(formatBusinessDate(today));
  const [endDate, setEndDate] = useState(formatBusinessDate(addDays(today, 1)));
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [priceSort, setPriceSort] = useState<'asc' | 'desc'>('asc');
  const [minPriceFilter, setMinPriceFilter] = useState<number | undefined>(undefined);
  const [maxPriceFilter, setMaxPriceFilter] = useState<number | undefined>(undefined);
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);

  // Regla de negocio: para reservar, el usuario debe tener DNI/NIE.
  const hasDocumentId = Boolean(user?.documentId?.trim());

  // Validación local para evitar llamadas innecesarias al backend.
  const dateValidationErrorKey = useMemo(() => {
    if (!startDate || !endDate) {
      return null;
    }

    return validateCreateReservationPayload({
      vehicleId: selectedVehicleId ?? 0,
      startDate,
      endDate,
    });
  }, [startDate, endDate, selectedVehicleId]);

  // Solo consultamos vehículos cuando el rango de fechas es válido.
  const canFetchAvailableVehicles = Boolean(startDate && endDate && !dateValidationErrorKey);

  const availableVehiclesQuery = useAvailableVehicles({
    startDate,
    endDate,
    enabled: canFetchAvailableVehicles,
  });

  // Filtrado visual por texto y orden por precio.
  const filteredVehicles = useMemo(() => {
    const vehicles = [...(availableVehiclesQuery.data ?? [])];
    const normalizedSearch = vehicleSearch.trim().toLowerCase();

    const bySearch = normalizedSearch
      ? vehicles.filter((vehicle) => {
          const text = `${vehicle.brand} ${vehicle.model} ${vehicle.licensePlate}`.toLowerCase();
          return text.includes(normalizedSearch);
        })
      : vehicles;

    // Aplicar filtros de precio y categoria en cliente sobre los vehículos disponibles
    const byFilters = bySearch.filter((vehicle) => {
      if (typeof minPriceFilter !== 'undefined' && vehicle.pricePerDay < minPriceFilter) return false;
      if (typeof maxPriceFilter !== 'undefined' && vehicle.pricePerDay > maxPriceFilter) return false;
      if (categoryFilter && vehicle.category?.toLowerCase() !== categoryFilter.toLowerCase()) return false;
      return true;
    });

    byFilters.sort((a, b) =>
      priceSort === 'asc' ? a.pricePerDay - b.pricePerDay : b.pricePerDay - a.pricePerDay,
    );

    return byFilters;
  }, [availableVehiclesQuery.data, priceSort, vehicleSearch, minPriceFilter, maxPriceFilter, categoryFilter]);

  const selectedVehicle =
    filteredVehicles.find((vehicle) => vehicle.id === selectedVehicleId) ??
    availableVehiclesQuery.data?.find((vehicle) => vehicle.id === selectedVehicleId);

  // Orden visual de histórico por fecha de inicio descendente.
  const reservations = useMemo(() => {
    const items = [...(myReservationsQuery.data ?? [])];

    items.sort((a, b) => {
      const aDate = parseBusinessDate(a.startDate);
      const bDate = parseBusinessDate(b.startDate);

      if (!aDate || !bDate) return b.id - a.id;
      return bDate.getTime() - aDate.getTime();
    });

    return items;
  }, [myReservationsQuery.data]);

  const openCreateModal = () => {
    if (!hasDocumentId) {
      showError(t('reservations.profileIncompleteMessage'));
      return;
    }

    setIsCreateModalVisible(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalVisible(false);
  };

  const applyQuickDateRange = (startOffsetDays: number, endOffsetDays: number) => {
    setStartDate(formatBusinessDate(addDays(today, startOffsetDays)));
    setEndDate(formatBusinessDate(addDays(today, endOffsetDays)));
  };

  const handleCreateReservation = () => {
    if (!hasDocumentId) {
      showError(t('reservations.profileIncompleteMessage'));
      return;
    }

    if (!startDate || !endDate) {
      showError(t('reservations.fillDatesFirst'));
      return;
    }

    if (dateValidationErrorKey) {
      showError(t(dateValidationErrorKey));
      return;
    }

    if (!selectedVehicleId) {
      showError(t('reservations.selectVehicleRequired'));
      return;
    }

    createReservationMutation.mutate(
      {
        vehicleId: selectedVehicleId,
        startDate,
        endDate,
      },
      {
        onSuccess: () => {
          showSuccess(t('reservations.createSuccess'));
          closeCreateModal();
          setSelectedVehicleId(null);
          setVehicleSearch('');
        },
        onError: (error) => {
          showError(error instanceof Error ? error.message : t('common.unexpectedError'));
        },
      },
    );
  };

  const handleCancelReservation = (reservationId: number) => {
    cancelReservationMutation.mutate(reservationId, {
      onSuccess: () => showSuccess(t('reservations.cancelSuccess')),
      onError: (error) => showError(error instanceof Error ? error.message : t('common.unexpectedError')),
    });
  };

  return {
    myReservationsQuery,
    createReservationMutation,
    cancelReservationMutation,
    SnackbarUI,
    reservations,
    hasDocumentId,
    isCreateModalVisible,
    openCreateModal,
    closeCreateModal,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    selectedVehicleId,
    setSelectedVehicleId,
    vehicleSearch,
    setVehicleSearch,
    priceSort,
    setPriceSort,
    canFetchAvailableVehicles,
    availableVehiclesQuery,
    filteredVehicles,
    selectedVehicle,
    dateValidationErrorKey,
    applyQuickDateRange,
    handleCreateReservation,
    handleCancelReservation,
    minPriceFilter,
    setMinPriceFilter,
    maxPriceFilter,
    setMaxPriceFilter,
    categoryFilter,
    setCategoryFilter,
  };
}
