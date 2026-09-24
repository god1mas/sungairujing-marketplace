"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const CART_STORAGE_VERSION = 1;
export const CART_STORAGE_KEY = "sungairujing-cart";

export type CartItem = {
  productId: string;
  merchantId: string;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  hasHydrated: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeMerchantItems: (merchantId: string) => void;
  setHasHydrated: (value: boolean) => void;
};

const validQuantity = (quantity: number) =>
  Number.isSafeInteger(quantity) && quantity >= 1;

export const groupCartItems = (items: CartItem[]) => {
  const groups = new Map<string, CartItem[]>();
  for (const item of items) {
    const group = groups.get(item.merchantId) ?? [];
    group.push(item);
    groups.set(item.merchantId, group);
  }
  return groups;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      hasHydrated: false,
      addItem: (item) => {
        if (!validQuantity(item.quantity)) return;
        set((state) => {
          const existing = state.items.find(
            ({ productId }) => productId === item.productId,
          );
          return {
            items: existing
              ? state.items.map((current) =>
                  current.productId === item.productId
                    ? {
                        ...current,
                        merchantId: item.merchantId,
                        quantity: current.quantity + item.quantity,
                      }
                    : current,
                )
              : [...state.items, item],
          };
        });
      },
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        })),
      updateQuantity: (productId, quantity) => {
        if (!validQuantity(quantity)) return;
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId ? { ...item, quantity } : item,
          ),
        }));
      },
      removeMerchantItems: (merchantId) =>
        set((state) => ({
          items: state.items.filter((item) => item.merchantId !== merchantId),
        })),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: CART_STORAGE_KEY,
      version: CART_STORAGE_VERSION,
      partialize: ({ items }) => ({ items }),
      migrate: (persisted, version) =>
        version === CART_STORAGE_VERSION &&
        typeof persisted === "object" &&
        persisted !== null
          ? (persisted as Pick<CartState, "items">)
          : { items: [] },
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    },
  ),
);
