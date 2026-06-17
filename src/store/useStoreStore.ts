import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface ShopifyStore {
  id: number;
  name: string;
  domain: string;
  status: string;
  expiry: string;
  orders: number;
  clientId?: string;
  clientSecret?: string;
  isPaused?: boolean;
}

interface StoreState {
  stores: ShopifyStore[];
  addStore: (store: Omit<ShopifyStore, 'id' | 'status' | 'expiry' | 'orders'>) => void;
  updateStore: (id: number, updates: Partial<ShopifyStore>) => void;
  deleteStore: (id: number) => void;
  togglePause: (id: number) => void;
  setStores: (stores: ShopifyStore[]) => void;
}

export const useStoreStore = create<StoreState>()(
  persist(
    (set, get) => ({
      stores: [
        {
          id: 1,
          name: "Main Shopify Store",
          domain: "gv-test-store.myshopify.com",
          status: "Token Active",
          expiry: "2026-12-31",
          orders: 1250,
          isPaused: false
        }
      ],
      
      addStore: (storeData) => set((state) => ({
        stores: [
          ...state.stores,
          {
            ...storeData,
            id: state.stores.length > 0 ? Math.max(...state.stores.map(s => s.id)) + 1 : 1,
            status: "Inactive",
            expiry: "Pending Test",
            orders: 0,
            isPaused: false
          }
        ]
      })),

      updateStore: (id, updates) => set((state) => ({
        stores: state.stores.map((s) => (s.id === id ? { ...s, ...updates } : s))
      })),

      deleteStore: (id) => set((state) => ({
        stores: state.stores.filter((s) => s.id !== id)
      })),

      togglePause: (id) => set((state) => ({
        stores: state.stores.map((s) => 
          s.id === id ? { ...s, isPaused: !s.isPaused, status: !s.isPaused ? "Paused" : (s.expiry === "Pending Test" ? "Inactive" : "Token Active") } : s
        )
      })),

      setStores: (stores) => set({ stores })
    }),
    {
      name: 'gv-store-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
