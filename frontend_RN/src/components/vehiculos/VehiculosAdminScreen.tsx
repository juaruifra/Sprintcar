import React from 'react';
import { FlatList, View } from 'react-native';
import { ActivityIndicator, Button, FAB, Searchbar, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useVehiculosAdminScreen } from '../../hooks/vehiculos/useVehiculosAdminScreen';
import AppHeader from '../layout/AppHeader';
import VehicleFormModal from './form/VehicleFormModal';
import VehicleAdminCard from './VehicleAdminCard';

export default function VehiculosAdminScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const {
    search,
    setSearch,
    vehicles,
    vehiclesQuery,
    isCreateVisible,
    editingVehicle,
    createVehicleMutation,
    updateVehicleMutation,
    openCreateModal,
    closeCreateModal,
    openEditModal,
    closeEditModal,
    handleCreate,
    handleUpdate,
    handleToggleAvailability,
    emptyFormValues,
    editingFormValues,
  } = useVehiculosAdminScreen();

  if (vehiclesQuery.isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <AppHeader />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator />
        </View>
      </View>
    );
  }

  if (vehiclesQuery.error) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <AppHeader />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
          <Text>{vehiclesQuery.error.message}</Text>
          <Button style={{ marginTop: 12 }} mode="contained" onPress={() => vehiclesQuery.refetch()}>
            {t('common.retry')}
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <AppHeader />

      <View style={{ padding: 16, gap: 12 }}>
        <Searchbar
          placeholder={t('vehicles.searchPlaceholder')}
          value={search}
          onChangeText={setSearch}
        />

        <FlatList
          data={vehicles}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingBottom: 100, gap: 12 }}
          renderItem={({ item }) => (
            <VehicleAdminCard
              vehicle={item}
              onEdit={openEditModal}
              onToggleAvailability={handleToggleAvailability}
              isUpdating={updateVehicleMutation.isPending}
            />
          )}
          ListEmptyComponent={<Text>{t('vehicles.empty')}</Text>}
        />
      </View>

      <FAB icon="plus" style={{ position: 'absolute', right: 16, bottom: 16 }} onPress={openCreateModal} />

      <VehicleFormModal
        visible={isCreateVisible}
        title={t('vehicles.create')}
        submitLabel={t('common.save')}
        defaultValues={emptyFormValues}
        onDismiss={closeCreateModal}
        onSubmit={handleCreate}
        isSubmitting={createVehicleMutation.isPending}
      />

      <VehicleFormModal
        visible={!!editingVehicle}
        title={t('vehicles.edit')}
        submitLabel={t('common.save')}
        defaultValues={editingFormValues}
        onDismiss={closeEditModal}
        onSubmit={handleUpdate}
        isSubmitting={updateVehicleMutation.isPending}
      />
    </View>
  );
}
