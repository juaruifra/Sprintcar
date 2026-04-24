import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCreateVehicle } from './useCreateVehicle';
import { useAdminVehicles } from './useAdminVehicles';
import { useUpdateVehicle } from './useUpdateVehicle';
import { Vehicle, VehicleInput } from '../../types/vehicles/Vehicle';
import { VehicleFormValues } from '../../components/vehiculos/form/VehicleForm.types';
import { useSnackbar } from '../useSnackbar';

const emptyFormValues: VehicleFormValues = {
  licensePlate: '',
  brand: '',
  model: '',
  year: '',
  category: '',
  pricePerDay: '',
  mileage: '',
  color: '',
  fuel: '',
  status: 'DISPONIBLE',
};

function mapFormToPayload(values: VehicleFormValues): VehicleInput {
  // Convertimos strings del formulario a los tipos requeridos por la API.
  return {
    licensePlate: values.licensePlate,
    brand: values.brand,
    model: values.model,
    year: Number(values.year),
    category: values.category || undefined,
    pricePerDay: Number(values.pricePerDay),
    mileage: values.mileage ? Number(values.mileage) : undefined,
    color: values.color || undefined,
    fuel: values.fuel || undefined,
    status: values.status,
  };
}

function mapVehicleToFormValues(vehicle: Vehicle): VehicleFormValues {
  return {
    licensePlate: vehicle.licensePlate,
    brand: vehicle.brand,
    model: vehicle.model,
    year: String(vehicle.year),
    category: vehicle.category ?? '',
    pricePerDay: String(vehicle.pricePerDay),
    mileage: vehicle.mileage ? String(vehicle.mileage) : '',
    color: vehicle.color ?? '',
    fuel: vehicle.fuel ?? '',
    status: vehicle.status,
  };
}

// Hook de pantalla para concentrar estado y acciones de gestión de vehículos admin.
export function useVehiculosAdminScreen() {
  const { t } = useTranslation();
  const { showError, SnackbarUI } = useSnackbar();

  const [search, setSearch] = useState('');
  const [isCreateVisible, setIsCreateVisible] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  // Filtros para administración (pueden ser vinculados a un UI de filtros)
  const [minPriceFilter, setMinPriceFilter] = useState<number | undefined>(undefined);
  const [maxPriceFilter, setMaxPriceFilter] = useState<number | undefined>(undefined);
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const vehiclesQuery = useAdminVehicles({
    minPrice: minPriceFilter,
    maxPrice: maxPriceFilter,
    category: categoryFilter,
    status: statusFilter,
  });
  const createVehicleMutation = useCreateVehicle();
  const updateVehicleMutation = useUpdateVehicle();

  const vehicles = useMemo(() => {
    const list = vehiclesQuery.data ?? [];
    const term = search.toLowerCase().trim();

    if (!term) {
      return list;
    }

    return list.filter((vehicle) => {
      return (
        vehicle.licensePlate.toLowerCase().includes(term) ||
        vehicle.brand.toLowerCase().includes(term) ||
        vehicle.model.toLowerCase().includes(term)
      );
    });
  }, [vehiclesQuery.data, search]);

  const openCreateModal = () => setIsCreateVisible(true);
  const closeCreateModal = () => setIsCreateVisible(false);
  const openEditModal = (vehicle: Vehicle) => setEditingVehicle(vehicle);
  const closeEditModal = () => setEditingVehicle(null);

  const handleCreate = (values: VehicleFormValues) => {
    // Si backend devuelve error (ej. matrícula duplicada), lo mostramos de forma visible.
    createVehicleMutation.mutate(mapFormToPayload(values), {
      onSuccess: closeCreateModal,
      onError: (error) => {
        showError(error instanceof Error ? error.message : t('common.unexpectedError'));
      },
    });
  };

  const handleUpdate = (values: VehicleFormValues) => {
    if (!editingVehicle) {
      return;
    }

    updateVehicleMutation.mutate(
      {
        vehicleId: editingVehicle.id,
        payload: mapFormToPayload(values),
      },
      {
        onSuccess: closeEditModal,
        onError: (error) => {
          showError(error instanceof Error ? error.message : t('common.unexpectedError'));
        },
      },
    );
  };

  const handleToggleAvailability = (vehicle: Vehicle, enabled: boolean) => {
    const nextStatus = enabled ? 'DISPONIBLE' : 'NO_DISPONIBLE';

    updateVehicleMutation.mutate({
      vehicleId: vehicle.id,
      payload: { status: nextStatus },
    }, {
      onError: (error) => {
        showError(error instanceof Error ? error.message : t('common.unexpectedError'));
      },
    });
  };

  return {
    // filtros (exponer para UI)
    minPriceFilter,
    setMinPriceFilter,
    maxPriceFilter,
    setMaxPriceFilter,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    search,
    setSearch,
    vehicles,
    vehiclesQuery,
    isCreateVisible,
    editingVehicle,
    createVehicleMutation,
    updateVehicleMutation,
    SnackbarUI,
    openCreateModal,
    closeCreateModal,
    openEditModal,
    closeEditModal,
    handleCreate,
    handleUpdate,
    handleToggleAvailability,
    emptyFormValues,
    editingFormValues: editingVehicle ? mapVehicleToFormValues(editingVehicle) : emptyFormValues,
  };
}
