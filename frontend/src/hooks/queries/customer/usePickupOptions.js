import { useQueries, useQuery } from '@tanstack/react-query';
import { pickupApi } from '../../../services/customer/pickupApi';
import { QUERY_KEYS } from '../../../constants';


function pickupOptionsQuery(farmerId, productIds) {
  const products = [...new Set(productIds)].sort((a, b) => a - b);
  return {
    queryKey: [...QUERY_KEYS.FARMER_PICKUP(farmerId), products.join(',')],
    queryFn: () => pickupApi.options({ farmerId, productIds: products }),
    enabled: Boolean(farmerId),
    staleTime: 60_000,
  };
}

export function usePickupOptions(farmerId, productIds = []) {
  return useQuery(pickupOptionsQuery(farmerId, productIds));
}


export function useProductPickupOptions(lines) {
  return useQueries({
    queries: lines.map((line) => pickupOptionsQuery(line.farmer_id, [line.product_id])),
    combine: (results) => ({
      isLoading: results.some((result) => result.isLoading),
      byProduct: Object.fromEntries(lines.map((line, index) => [line.product_id, results[index].data])),
    }),
  });
}
