import { beforeEach, describe, expect, it } from "vitest";
import { groupCartItems, useCartStore } from "./cart-store";

describe("cart store", () => {
  beforeEach(() => {
    localStorage.clear();
    useCartStore.setState({ items: [], hasHydrated: true });
  });

  it("adds, combines, updates, and removes product quantities", () => {
    const item = { productId: "p1", merchantId: "m1", quantity: 1 };
    useCartStore.getState().addItem(item);
    useCartStore.getState().addItem(item);
    expect(useCartStore.getState().items[0].quantity).toBe(2);

    useCartStore.getState().updateQuantity("p1", 4);
    expect(useCartStore.getState().items[0].quantity).toBe(4);
    useCartStore.getState().updateQuantity("p1", 0);
    expect(useCartStore.getState().items[0].quantity).toBe(4);

    useCartStore.getState().removeItem("p1");
    expect(useCartStore.getState().items).toEqual([]);
  });

  it("groups items per merchant without combining merchant checkout", () => {
    const groups = groupCartItems([
      { productId: "p1", merchantId: "m1", quantity: 1 },
      { productId: "p2", merchantId: "m2", quantity: 2 },
      { productId: "p3", merchantId: "m1", quantity: 3 },
    ]);
    expect(groups.get("m1")?.map((item) => item.productId)).toEqual([
      "p1",
      "p3",
    ]);
    expect(groups.get("m2")?.map((item) => item.productId)).toEqual(["p2"]);
  });

  it("persists only minimal versioned cart identity data", () => {
    useCartStore
      .getState()
      .addItem({ productId: "p1", merchantId: "m1", quantity: 2 });
    const persisted = JSON.parse(localStorage.getItem("sungairujing-cart")!);
    expect(persisted.version).toBe(1);
    expect(persisted.state).toEqual({
      items: [{ productId: "p1", merchantId: "m1", quantity: 2 }],
    });
  });
});
