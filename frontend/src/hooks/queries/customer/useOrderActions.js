import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../../../services/customer/ordersApi';
import { QUERY_KEYS } from '../../../constants';


function useOrderMutation(orderId, mutationFn, meta) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    meta,
    onSuccess: (order) => {
      queryClient.setQueryData(QUERY_KEYS.ORDER(orderId), order);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMER_DASHBOARD });
    },
  });
}


export function useCancelOrder(orderId) {
  return useOrderMutation(orderId, ({ version, reason }) =>
    ordersApi.cancel({ orderId, version, reason }));
}


export function useModifyOrder(orderId) {
  // The edit page shows the server's message itself, on the line it is about.
  return useOrderMutation(orderId, ({ version, body }) =>
    ordersApi.modify({ orderId, version, body }), { silent: true });
}
