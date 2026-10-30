import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { moneyToNumber } from '../utils/helpers/domain';
import { useMarketAuthStore } from './auth.store';


export const MAX_QUANTITY = 999;
export const MAX_FARMERS_PER_CHECKOUT = 5;


export function lineMin(line) {
  return Math.max(line.min_per_order ?? 1, 1);
}

export function lineMax(line) {
  return Math.min(line.max_per_order ?? MAX_QUANTITY, MAX_QUANTITY);
}

function clamp(quantity, line = {}) {
  return Math.min(Math.max(quantity, lineMin(line)), lineMax(line));
}

export const useCartStore = create(
  persist(
    (set) => ({
      // The cart on screen, for the account signed in now (or the guest).
      lines: [],
      // Saved carts of the accounts used on this browser, by user id.
      carts: {},
      // Whose cart `lines` is: a user id, 'guest', or null before the first sign-in check.
      ownerKey: null,

      addItem: (product, quantity = 1) =>
        set((state) => {
          const existing = state.lines.find((line) => line.product_id === product.product_id);
          if (!existing) {
            return { lines: [...state.lines, { ...product, quantity: clamp(quantity, product) }] };
          }
          return {
            lines: state.lines.map((line) =>
              (line.product_id === product.product_id
                ? { ...line, ...product, quantity: clamp(line.quantity + quantity, product) }
                : line)),
          };
        }),

      setQuantity: (productId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return { lines: state.lines.filter((line) => line.product_id !== productId) };
          }
          return {
            lines: state.lines.map((line) =>
              (line.product_id === productId ? { ...line, quantity: clamp(quantity, line) } : line)),
          };
        }),

      removeItem: (productId) =>
        set((state) => ({ lines: state.lines.filter((line) => line.product_id !== productId) })),

      
      refreshLines: (products) =>
        set((state) => {
          const byId = new Map(products.map((product) => [product.id, product]));
          return {
            lines: state.lines.map((line) => {
              const fresh = byId.get(line.product_id);
              if (!fresh) return { ...line, availability: 'UNAVAILABLE', stock_quantity: 0 };
              return {
                ...line,
                name: fresh.name,
                unit: fresh.unit,
                price: fresh.price,
                image: fresh.image,
                farmer_id: fresh.farmer.id,
                farmer_stall_name: fresh.farmer.stall_name,
                stock_quantity: fresh.stock_quantity,
                availability: fresh.availability,
                min_per_order: fresh.min_per_order ?? 1,
                max_per_order: fresh.max_per_order ?? null,
                quantity: clamp(line.quantity, fresh),
              };
            }),
          };
        }),

      clear: () => set({ lines: [] }),
    }),
    {
      name: 'marketlink-cart',
      partialize: (state) => ({ lines: state.lines, carts: state.carts, ownerKey: state.ownerKey }),
    },
  ),
);


const GUEST = 'guest';

// Each account keeps its own cart on this browser: signing out hides it, signing back in
// brings it back. A guest cart is dropped when someone signs in.
function switchCartOwner(userId) {
  const nextKey = userId ? String(userId) : GUEST;
  const { lines, carts, ownerKey } = useCartStore.getState();
  if (nextKey === ownerKey) return;
  if (ownerKey === null) {
    // Cart saved before per-account carts existed: it belongs to whoever is signed in now.
    useCartStore.setState({ ownerKey: nextKey, lines: nextKey === GUEST ? [] : lines });
    return;
  }
  const saved = { ...carts };
  if (ownerKey !== GUEST) saved[ownerKey] = lines;
  useCartStore.setState({
    carts: saved,
    ownerKey: nextKey,
    lines: nextKey === GUEST ? [] : (saved[nextKey] ?? []),
  });
}

switchCartOwner(useMarketAuthStore.getState().userId);
useMarketAuthStore.subscribe((state, previous) => {
  if (state.userId !== previous.userId) switchCartOwner(state.userId);
});


export function isOrderable(line) {
  return line.availability === undefined || line.availability === 'IN_STOCK';
}


export function cartGroups(lines) {
  const groups = [];
  const byFarmer = new Map();

  lines.forEach((line) => {
    let group = byFarmer.get(line.farmer_id);
    if (!group) {
      group = {
        farmer_id: line.farmer_id,
        farmer_stall_name: line.farmer_stall_name,
        lines: [],
        subtotal: 0,
      };
      byFarmer.set(line.farmer_id, group);
      groups.push(group);
    }
    group.lines.push(line);
    if (isOrderable(line)) {
      group.subtotal += moneyToNumber(line.price) * line.quantity;
    }
  });

  return groups;
}

export function cartTotal(lines) {
  return lines.reduce(
    (total, line) => (isOrderable(line) ? total + moneyToNumber(line.price) * line.quantity : total),
    0,
  );
}

export function cartCount(lines) {
  return lines.reduce((count, line) => count + line.quantity, 0);
}
