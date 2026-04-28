import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IncidentStatus } from '../../services/incidents/incidentsService';
import { useSnackbar } from '../useSnackbar';
import { useAdminIncidents } from './useAdminIncidents';
import { useIncidentActions } from './useIncidentActions';

export const ADMIN_INCIDENT_FILTERS: Array<'all' | IncidentStatus> = [
  'ABIERTA',
  'RESUELTA',
  'all',
];

export function useIncidentsAdminScreen() {
  const { t } = useTranslation();
  const { resolveMutation } = useIncidentActions();
  const { showSuccess, showError, SnackbarUI } = useSnackbar();

  const [statusFilter, setStatusFilter] = useState<'all' | IncidentStatus>('ABIERTA');
  const [searchDraft, setSearchDraft] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  // 5 por página, igual que en la vista de usuario y consistente con reservas.
  const [limit] = useState(5);

  const incidentsQuery = useAdminIncidents({ status: statusFilter, search, page, limit });

  const incidents = useMemo(() => incidentsQuery.data?.items ?? [], [incidentsQuery.data]);
  const counts = useMemo(() => incidentsQuery.data?.counts, [incidentsQuery.data]);

  const changeStatusFilter = (value: 'all' | IncidentStatus) => {
    setStatusFilter(value);
    setPage(1);
  };

  const applySearch = () => {
    setSearch(searchDraft);
    setPage(1);
  };

  const nextPage = () => setPage((p) => p + 1);
  const prevPage = () => setPage((p) => Math.max(1, p - 1));

  const handleResolve = (incidentId: number) => {
    resolveMutation.mutate(incidentId, {
      onSuccess: () => showSuccess(t('incidents.resolveSuccess')),
      onError: (error) =>
        showError(error instanceof Error ? error.message : t('common.unexpectedError')),
    });
  };

  return {
    incidentsQuery,
    incidents,
    counts,
    statusFilter,
    changeStatusFilter,
    searchDraft,
    setSearchDraft,
    search,
    applySearch,
    page,
    limit,
    nextPage,
    prevPage,
    handleResolve,
    isResolving: resolveMutation.isPending,
    SnackbarUI,
  };
}
