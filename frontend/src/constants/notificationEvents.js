import { QUERY_KEYS, authKeys, farmerKeys, notificationKeys } from './queryKeys';


export const NOTIFICATION_TYPES = Object.freeze({
  ORDER_ACCEPTED: 'ORDER_ACCEPTED',
  ORDER_READY: 'ORDER_READY',
  ORDER_DECLINED: 'ORDER_DECLINED',
  ORDER_EXPIRED: 'ORDER_EXPIRED',
  ORDER_CHANGE_APPROVED: 'ORDER_CHANGE_APPROVED',
  ORDER_CHANGE_REJECTED: 'ORDER_CHANGE_REJECTED',
  ORDER_ITEM_SOLD_OUT: 'ORDER_ITEM_SOLD_OUT',
  RESTOCK: 'RESTOCK',
  ORDER_PLACED: 'ORDER_PLACED',
  ORDER_MODIFIED: 'ORDER_MODIFIED',
  ORDER_CANCELLED: 'ORDER_CANCELLED',
  ORDER_CANCELLED_CUSTOMER_LOCKED: 'ORDER_CANCELLED_CUSTOMER_LOCKED',
  ACCOUNT_STATUS_CHANGED: 'ACCOUNT_STATUS_CHANGED',
  MARKET_SCHEDULE_CHANGED: 'MARKET_SCHEDULE_CHANGED',
  MARKET_CLOSED: 'MARKET_CLOSED',
});

const T = NOTIFICATION_TYPES;


const farmerOrderFamily = () => [
  farmerKeys.orders.all(),
  farmerKeys.products.all(),
  farmerKeys.dashboard.all(),
];



// The shopper's orders: list, any open detail page, and the dashboard counts.
const customerOrderFamily = () => [['orders'], ['order'], QUERY_KEYS.CUSTOMER_DASHBOARD];


const INVALIDATIONS = {
  [T.ORDER_ACCEPTED]: customerOrderFamily,
  [T.ORDER_READY]: customerOrderFamily,
  [T.ORDER_DECLINED]: customerOrderFamily,
  [T.ORDER_EXPIRED]: customerOrderFamily,
  [T.ORDER_CHANGE_APPROVED]: customerOrderFamily,
  [T.ORDER_CHANGE_REJECTED]: customerOrderFamily,
  [T.ORDER_ITEM_SOLD_OUT]: customerOrderFamily,
  [T.ORDER_PLACED]: farmerOrderFamily,
  [T.ORDER_MODIFIED]: farmerOrderFamily,
  [T.ORDER_CANCELLED]: farmerOrderFamily,
  [T.ORDER_CANCELLED_CUSTOMER_LOCKED]: farmerOrderFamily,
  [T.ACCOUNT_STATUS_CHANGED]: () => [authKeys.me(), farmerKeys.profile(), farmerKeys.dashboard.all()],
  [T.MARKET_SCHEDULE_CHANGED]: () => [farmerKeys.markets(), farmerKeys.closures(), ...customerOrderFamily()],
  
  [T.MARKET_CLOSED]: () => [farmerKeys.markets(), ...farmerOrderFamily(), ...customerOrderFamily()],
};

export function queryKeysForNotification(type) {
  const extra = INVALIDATIONS[type]?.() ?? [];
  return [notificationKeys.all(), ...extra];
}
