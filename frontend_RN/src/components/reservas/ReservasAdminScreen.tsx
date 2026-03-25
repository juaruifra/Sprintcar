import React, { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import {
  ActivityIndicator,
  Avatar,
  Button,
  Card,
  Chip,
  Searchbar,
  SegmentedButtons,
  Text,
  useTheme,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import AppHeader from '../layout/AppHeader';
import { useAdminReservations } from '../../hooks/reservas/useAdminReservations';
import { useCancelReservation } from '../../hooks/reservas/useCancelReservation';
import { useSnackbar } from '../../hooks/useSnackbar';

export default function ReservasAdminScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const reservationsQuery = useAdminReservations();
  const cancelReservationMutation = useCancelReservation();
  const { showSuccess, showError, SnackbarUI } = useSnackbar();
  const [statusFilter, setStatusFilter] = useState<'all' | 'CREADA' | 'CANCELADA'>('all');
  const [search, setSearch] = useState('');

  const reservations = useMemo(() => {
    const base = [...(reservationsQuery.data ?? [])];
    const normalizedSearch = search.trim().toLowerCase();

    return base.filter((item) => {
      const statusMatch = statusFilter === 'all' ? true : item.status === statusFilter;
      if (!statusMatch) return false;

      if (!normalizedSearch) return true;

      const text = `${item.id} ${item.userId} ${item.vehicleId} ${item.startDate} ${item.endDate} ${item.vehicle?.brand ?? ''} ${item.vehicle?.model ?? ''} ${item.vehicle?.licensePlate ?? ''}`.toLowerCase();
      return text.includes(normalizedSearch);
    });
  }, [reservationsQuery.data, search, statusFilter]);

  const handleCancelReservation = (reservationId: number) => {
    cancelReservationMutation.mutate(reservationId, {
      onSuccess: () => showSuccess(t('reservations.cancelSuccess')),
      onError: (error) => showError(error instanceof Error ? error.message : t('common.unexpectedError')),
    });
  };

  if (reservationsQuery.isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <AppHeader />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator />
        </View>
      </View>
    );
  }

  if (reservationsQuery.error) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <AppHeader />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
          <Text>{reservationsQuery.error.message}</Text>
          <Button style={{ marginTop: 12 }} mode="contained" onPress={() => reservationsQuery.refetch()}>
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
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 100 }}
        ListHeaderComponent={
          <Card style={{ marginBottom: 12 }}>
            <Card.Title
              title={t('reservations.adminHistoryTitle')}
              subtitle={t('reservations.adminHistorySubtitle')}
              left={(props) => <Avatar.Icon {...props} icon="clipboard-list" />}
            />
            <Card.Content style={{ gap: 10 }}>
              <Searchbar
                placeholder={t('reservations.searchReservationPlaceholder')}
                value={search}
                onChangeText={setSearch}
              />

              <SegmentedButtons
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as 'all' | 'CREADA' | 'CANCELADA')}
                buttons={[
                  { value: 'all', label: t('reservations.filterAll') },
                  { value: 'CREADA', label: t('reservations.status.created') },
                  { value: 'CANCELADA', label: t('reservations.status.cancelled') },
                ]}
              />
            </Card.Content>
          </Card>
        }
        ListEmptyComponent={
          <Card>
            <Card.Content>
              <Text>{t('reservations.emptyAdmin')}</Text>
            </Card.Content>
          </Card>
        }
        renderItem={({ item }) => {
          const isCancelled = item.status === 'CANCELADA';

          return (
            <Card style={{ borderRadius: 16 }}>
              <Card.Title
                title={`${t('reservations.reservationIdLabel')} #${item.id}`}
                subtitle={item.vehicle
                  ? `${t('reservations.userIdLabel')} #${item.userId} · ${item.vehicle.brand} ${item.vehicle.model}`
                  : `${t('reservations.userIdLabel')} #${item.userId} · ${t('reservations.vehicleIdLabel')} #${item.vehicleId}`}
                left={(props) => (
                  <Avatar.Icon
                    {...props}
                    icon={isCancelled ? 'calendar-remove' : 'calendar-check'}
                    style={{ backgroundColor: isCancelled ? theme.colors.errorContainer : theme.colors.primaryContainer }}
                  />
                )}
              />
              <Card.Content>
                <Text>{`${item.startDate} → ${item.endDate}`}</Text>

                <Text style={{ marginTop: 6 }}>
                  {t('reservations.licensePlateLabel')}: {item.vehicle?.licensePlate ?? `#${item.vehicleId}`}
                </Text>

                {item.vehicle ? (
                  <Text style={{ marginTop: 4 }}>
                    {t('reservations.pricePerDayLabel')}: {item.vehicle.pricePerDay.toFixed(2)} €
                  </Text>
                ) : null}

                <Chip
                  icon={isCancelled ? 'close-circle' : 'check-circle'}
                  style={{ marginVertical: 10, alignSelf: 'flex-start' }}
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

      <SnackbarUI />
    </View>
  );
}
