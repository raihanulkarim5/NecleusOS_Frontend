import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services';

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => dashboardService.getSummary(),
  });
}
