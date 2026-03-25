import React from 'react';
import { FlatList, ScrollView, View } from 'react-native';
import {
  ActivityIndicator,
  Avatar,
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
import { useReservasUserScreen } from '../../hooks/reservas/useReservasUserScreen';
import ReservationUserCard from './cards/ReservationUserCard';

export default function ReservasUserScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const {
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
  } = useReservasUserScreen();

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
        renderItem={({ item }) => (
          <ReservationUserCard
            reservation={item}
            isCancelling={cancelReservationMutation.isPending}
            onCancel={handleCancelReservation}
          />
        )}
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
              <Card.Title title={t('reservations.dateRangeTitle')} />
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
              <Card.Title title={t('reservations.selectVehicleTitle')} />
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
