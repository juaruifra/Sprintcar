import React, { useMemo, useState } from 'react';
import { FlatList, ScrollView, View } from 'react-native';
import {
  Avatar,
  ActivityIndicator,
  Button,
  Card,
  Chip,
  FAB,
  HelperText,
  Modal,
  Portal,
  Searchbar,
  SegmentedButtons,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import AppHeader from '../layout/AppHeader';
import { useUserStore } from '../../store/userStore';
import { useMyReservations } from '../../hooks/reservas/useMyReservations';
import { useCancelReservation } from '../../hooks/reservas/useCancelReservation';
import { useCreateReservation } from '../../hooks/reservas/useCreateReservation';
import { useAvailableVehicles } from '../../hooks/vehiculos/useAvailableVehicles';
import { useSnackbar } from '../../hooks/useSnackbar';
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

export default function ReservasUserScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const user = useUserStore((state) => state.user);

  const myReservationsQuery = useMyReservations();
  const createReservationMutation = useCreateReservation();
  const cancelReservationMutation = useCancelReservation();
  const { showSuccess, showError, SnackbarUI } = useSnackbar();

  // Estado local del formulario modal.
  const today = useMemo(() => new Date(), []);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [startDate, setStartDate] = useState(formatBusinessDate(today));
  const [endDate, setEndDate] = useState(formatBusinessDate(addDays(today, 1)));
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [priceSort, setPriceSort] = useState<'asc' | 'desc'>('asc');

  // El usuario debe tener DNI/NIE informado para permitir crear reservas.
  const hasDocumentId = Boolean(user?.documentId?.trim());

  // Validación local rápida para evitar llamadas al backend cuando ya sabemos que fallará.
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

  // Solo consultamos vehículos por rango cuando las fechas están completas y son válidas.
  const canFetchAvailableVehicles = Boolean(startDate && endDate && !dateValidationErrorKey);

  const availableVehiclesQuery = useAvailableVehicles({
    startDate,
    endDate,
    enabled: canFetchAvailableVehicles,
  });

  const filteredVehicles = useMemo(() => {
    const vehicles = [...(availableVehiclesQuery.data ?? [])];
    const normalizedSearch = vehicleSearch.trim().toLowerCase();

    const bySearch = normalizedSearch
      ? vehicles.filter((vehicle) => {
          const text = `${vehicle.brand} ${vehicle.model} ${vehicle.licensePlate}`.toLowerCase();
          return text.includes(normalizedSearch);
        })
      : vehicles;

    bySearch.sort((a, b) =>
      priceSort === 'asc' ? a.pricePerDay - b.pricePerDay : b.pricePerDay - a.pricePerDay,
    );

    return bySearch;
  }, [availableVehiclesQuery.data, priceSort, vehicleSearch]);

  const selectedVehicle = filteredVehicles.find((vehicle) => vehicle.id === selectedVehicleId)
    ?? availableVehiclesQuery.data?.find((vehicle) => vehicle.id === selectedVehicleId);

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
    // Regla de negocio: si faltan datos críticos del perfil, no se permite reservar.
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

  if (myReservationsQuery.isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <AppHeader />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator />
        </View>
      </View>
    );
  }

  if (myReservationsQuery.error) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <AppHeader />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
          <Text>{myReservationsQuery.error.message}</Text>
          <Button style={{ marginTop: 12 }} mode="contained" onPress={() => myReservationsQuery.refetch()}>
            {t('common.retry')}
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <AppHeader />

      <FlatList
        data={reservations}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 120 }}
        ListHeaderComponent={
          <Card style={{ marginBottom: 12 }}>
            <Card.Title
              title={t('reservations.historyTitle')}
              subtitle={t('reservations.historySubtitle')}
              left={(props) => <Avatar.Icon {...props} icon="history" />}
            />
            {!hasDocumentId ? (
              <Card.Content>
                <HelperText type="error" visible>
                  {t('reservations.profileIncompleteMessage')}
                </HelperText>
              </Card.Content>
            ) : null}
          </Card>
        }
        ListEmptyComponent={
          <Card>
            <Card.Content>
              <Text>{t('reservations.emptyMine')}</Text>
            </Card.Content>
          </Card>
        }
        renderItem={({ item }) => {
          const isCancelled = item.status === 'CANCELADA';

          return (
            <Card style={{ borderRadius: 16 }}>
              <Card.Title
                title={item.vehicle ? `${item.vehicle.brand} ${item.vehicle.model}` : `${t('reservations.vehicleIdLabel')} #${item.vehicleId}`}
                subtitle={`${item.startDate} → ${item.endDate}`}
                left={(props) => (
                  <Avatar.Icon
                    {...props}
                    icon={isCancelled ? 'calendar-remove' : 'calendar-check'}
                    style={{ backgroundColor: isCancelled ? theme.colors.errorContainer : theme.colors.primaryContainer }}
                  />
                )}
              />
              <Card.Content>
                <Text style={{ marginBottom: 6 }}>
                  {t('reservations.licensePlateLabel')}: {item.vehicle?.licensePlate ?? `#${item.vehicleId}`}
                </Text>

                {item.vehicle ? (
                  <Text style={{ marginBottom: 10 }}>
                    {t('reservations.pricePerDayLabel')}: {item.vehicle.pricePerDay.toFixed(2)} €
                  </Text>
                ) : null}

                <Chip
                  icon={isCancelled ? 'close-circle' : 'check-circle'}
                  style={{ alignSelf: 'flex-start', marginBottom: 10 }}
                >
                  {t('reservations.statusLabel')}: {isCancelled ? t('reservations.status.cancelled') : t('reservations.status.created')}
                </Chip>
                <Button
                  mode="outlined"
                  onPress={() => handleCancelReservation(item.id)}
                  disabled={isCancelled || cancelReservationMutation.isPending}
                >
                  {t('reservations.cancelAction')}
                </Button>
              </Card.Content>
            </Card>
          );
        }}
      />

      <FAB
        icon="plus"
        style={{ position: 'absolute', right: 16, bottom: 16 }}
        onPress={openCreateModal}
      />

      <Portal>
        <Modal
          visible={isCreateModalVisible}
          onDismiss={closeCreateModal}
          contentContainerStyle={{
            backgroundColor: theme.colors.background,
            margin: 16,
            borderRadius: 16,
            maxHeight: '90%',
          }}
        >
          <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
            <Text variant="titleMedium">{t('reservations.createTitle')}</Text>

            <Card>
              <Card.Title title={t('reservations.dateRangeTitle')} left={(props) => <Avatar.Icon {...props} icon="calendar" />} />
              <Card.Content style={{ gap: 10 }}>
                <TextInput
                  mode="outlined"
                  label={t('reservations.startDate')}
                  value={startDate}
                  onChangeText={setStartDate}
                  placeholder="DD/MM/YYYY"
                  right={<TextInput.Icon icon="calendar" />}
                />

                <TextInput
                  mode="outlined"
                  label={t('reservations.endDate')}
                  value={endDate}
                  onChangeText={setEndDate}
                  placeholder="DD/MM/YYYY"
                  right={<TextInput.Icon icon="calendar" />}
                />

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  <Chip onPress={() => applyQuickDateRange(0, 1)}>{t('reservations.quick.tomorrow')}</Chip>
                  <Chip onPress={() => applyQuickDateRange(0, 3)}>{t('reservations.quick.threeDays')}</Chip>
                  <Chip onPress={() => applyQuickDateRange(0, 7)}>{t('reservations.quick.sevenDays')}</Chip>
                </View>

                {dateValidationErrorKey ? (
                  <HelperText type="error" visible>
                    {t(dateValidationErrorKey)}
                  </HelperText>
                ) : null}
              </Card.Content>
            </Card>

            <Card>
              <Card.Title title={t('reservations.selectVehicleTitle')} left={(props) => <Avatar.Icon {...props} icon="car-multiple" />} />
              <Card.Content style={{ gap: 10 }}>
                <Searchbar
                  placeholder={t('reservations.searchVehiclePlaceholder')}
                  value={vehicleSearch}
                  onChangeText={setVehicleSearch}
                />

                <SegmentedButtons
                  value={priceSort}
                  onValueChange={(value) => setPriceSort(value as 'asc' | 'desc')}
                  buttons={[
                    { value: 'asc', label: t('reservations.sortPriceAsc') },
                    { value: 'desc', label: t('reservations.sortPriceDesc') },
                  ]}
                />

                {!canFetchAvailableVehicles ? (
                  <HelperText type="info" visible>
                    {t('reservations.fillDatesFirst')}
                  </HelperText>
                ) : null}

                {canFetchAvailableVehicles && availableVehiclesQuery.isLoading ? <ActivityIndicator /> : null}

                {canFetchAvailableVehicles && !availableVehiclesQuery.isLoading && filteredVehicles.length === 0 ? (
                  <HelperText type="error" visible>
                    {t('reservations.noVehiclesForRange')}
                  </HelperText>
                ) : null}

                {filteredVehicles.map((vehicle) => {
                  const isSelected = selectedVehicleId === vehicle.id;

                  return (
                    <Card
                      key={vehicle.id}
                      mode="outlined"
                      style={{
                        borderWidth: isSelected ? 2 : 1,
                        borderColor: isSelected ? theme.colors.primary : theme.colors.outlineVariant,
                      }}
                      onPress={() => setSelectedVehicleId(vehicle.id)}
                    >
                      <Card.Title
                        title={`${vehicle.brand} ${vehicle.model}`}
                        subtitle={vehicle.licensePlate}
                        left={(props) => <Avatar.Icon {...props} icon="car" />}
                      />
                      <Card.Content>
                        <Text>{t('reservations.pricePerDayLabel')}: {vehicle.pricePerDay.toFixed(2)} €</Text>
                      </Card.Content>
                    </Card>
                  );
                })}
              </Card.Content>
            </Card>

            {selectedVehicle ? (
              <Card>
                <Card.Content>
                  <Text>
                    {t('reservations.selectedVehicleSummary')}: {selectedVehicle.brand} {selectedVehicle.model} · {selectedVehicle.licensePlate}
                  </Text>
                </Card.Content>
              </Card>
            ) : null}

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button mode="outlined" style={{ flex: 1 }} onPress={closeCreateModal}>
                {t('common.cancel')}
              </Button>
              <Button
                mode="contained"
                style={{ flex: 1 }}
                onPress={handleCreateReservation}
                loading={createReservationMutation.isPending}
                disabled={createReservationMutation.isPending || !hasDocumentId}
              >
                {t('reservations.createAction')}
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>

      <SnackbarUI />
    </View>
  );
}
