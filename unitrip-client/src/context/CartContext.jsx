import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "unitrip_cart";

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => loadCart());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  function addItem(entry) {
    setItems((list) => {
      const key = `${entry.packageId}|${(entry.placeIds || []).slice().sort().join(",")}`;
      const existing = list.find(
        (i) =>
          `${i.packageId}|${(i.placeIds || []).slice().sort().join(",")}` === key &&
          i.travelDate === (entry.travelDate || "")
      );
      if (existing) {
        return list.map((i) =>
          i.id === existing.id
            ? {
                ...i,
                travellersCount:
                  (Number(i.travellersCount) || 1) + (Number(entry.travellersCount) || 1),
              }
            : i
        );
      }
      return [
        ...list,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          packageId: entry.packageId,
          title: entry.title,
          slug: entry.slug,
          city: entry.city,
          amount: entry.amount,
          image: entry.image || "",
          travellersCount: Number(entry.travellersCount) || 1,
          travelDate: entry.travelDate || "",
          placeIds: entry.placeIds || [],
          addOnsPreview: entry.addOnsPreview || [],
          addOnsAmount: entry.addOnsAmount || 0,
        },
      ];
    });
  }

  function updateItem(id, patch) {
    setItems((list) => list.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }

  function removeItem(id) {
    setItems((list) => list.filter((i) => i.id !== id));
  }

  function clearCart() {
    setItems([]);
  }

  const count = useMemo(
    () => items.reduce((s, i) => s + (Number(i.travellersCount) || 1), 0),
    [items]
  );

  const subtotal = useMemo(
    () =>
      items.reduce(
        (s, i) =>
          s +
          (Number(i.amount) || 0) * (Number(i.travellersCount) || 1) +
          (Number(i.addOnsAmount) || 0),
        0
      ),
    [items]
  );

  const value = {
    items,
    count,
    subtotal,
    addItem,
    updateItem,
    removeItem,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
