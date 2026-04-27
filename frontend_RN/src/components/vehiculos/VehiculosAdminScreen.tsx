import React, { useState } from 'react';
import { FlatList, ScrollView, View } from 'react-native';
import { ActivityIndicator, Button, FAB, IconButton, Menu, Searchbar, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useVehiculosAdminScreen } from '../../hooks/vehiculos/useVehiculosAdminScreen';
import AppHeader from '../layout/AppHeader';
import VehicleFormModal from './form/VehicleFormModal';
import VehicleAdminCard from './VehicleAdminCard';
import AuthTextInput from '../AuthTextInput';

export default function VehiculosAdminScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const [isStatusMenuVisible, setIsStatusMenuVisible] = useState(false);
  const {
    search,
    setSearch,
    vehicles,
    vehiclesQuery,
    minPriceFilter,
    setMinPriceFilter,
    maxPriceFilter,
    setMaxPriceFilter,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    applyFilters,
    clearFilters,
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
    editingFormValues,
  } = useVehiculosAdminScreen();

  if (vehiclesQuery.isLoading && !vehiclesQuery.data) {
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

        {/* Fila compacta: todos los filtros y acciones en una sola línea desplazable */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, alignItems: 'center' }}>
          <AuthTextInput
            label={t('vehicles.filters.minPrice')}
            keyboardType="decimal-pad"
            style={{ width: 120, marginBottom: 0 }}
            value={minPriceFilter !== undefined ? String(minPriceFilter) : ''}
            onChangeText={(v) => setMinPriceFilter(v ? Number(v) : undefined)}
          />

          <AuthTextInput
            label={t('vehicles.filters.maxPrice')}
            keyboardType="decimal-pad"
            style={{ width: 120, marginBottom: 0 }}
            value={maxPriceFilter !== undefined ? String(maxPriceFilter) : ''}
            onChangeText={(v) => setMaxPriceFilter(v ? Number(v) : undefined)}
          />

          <AuthTextInput
            label={t('vehicles.filters.category')}
            style={{ width: 150, marginBottom: 0 }}
            value={categoryFilter ?? ''}
            onChangeText={setCategoryFilter}
          />

          {/* Estado en menú desplegable para evitar texto libre y ahorrar espacio */}
          <Menu
            visible={isStatusMenuVisible}
            onDismiss={() => setIsStatusMenuVisible(false)}
            anchor={
              <Button mode="outlined" compact onPress={() => setIsStatusMenuVisible(true)}>
                {statusFilter === 'DISPONIBLE'
                  ? t('vehicles.status.available')
                  : statusFilter === 'NO_DISPONIBLE'
                    ? t('vehicles.status.unavailable')
                    : t('vehicles.filters.allStatuses')}
              </Button>
            }
          >
            <Menu.Item
              title={t('vehicles.filters.allStatuses')}
              onPress={() => {
                setStatusFilter(undefined);
                setIsStatusMenuVisible(false);
              }}
            />
            <Menu.Item
              title={t('vehicles.status.available')}
              onPress={() => {
                setStatusFilter('DISPONIBLE');
                setIsStatusMenuVisible(false);
              }}
            />
            <Menu.Item
              title={t('vehicles.status.unavailable')}
              onPress={() => {
                setStatusFilter('NO_DISPONIBLE');
                setIsStatusMenuVisible(false);
              }}
            />
          </Menu>

          <IconButton icon="filter-remove-outline" onPress={clearFilters} accessibilityLabel={t('common.clear')} />
          <IconButton icon="filter-check-outline" onPress={applyFilters} accessibilityLabel={t('common.apply')} />
        </ScrollView>

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

      <SnackbarUI />
    </View>
  );
}
