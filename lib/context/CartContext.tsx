'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { CartItem, Product, Sauce } from '@/types';
import { useAnnouncer } from '@/components/Announcer';
import { formatNaira } from '@/lib/utils/format';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, sauce: Sauce | null, quantity?: number) => void;
  updateQuantity: (itemId: string, newQuantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  totalCount: number;
  subtotal: number;
  isLoaded: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'emari_grill_cart_v1';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { announce } = useAnnouncer();

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Could not read cart from localStorage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Could not write cart to localStorage', e);
    }
  }, [items, isLoaded]);

  const addItem = useCallback(
    (product: Product, sauce: Sauce | null, quantity: number = 1) => {
      if (quantity <= 0) return;

      const unitPrice = sauce ? product.price_with_sauce : product.base_price;
      const sauceId = sauce ? sauce.id : 'no-sauce';
      const itemId = `${product.id}__${sauceId}`;

      setItems((prevItems) => {
        const existingIndex = prevItems.findIndex((i) => i.id === itemId);
        if (existingIndex > -1) {
          const updated = [...prevItems];
          const newQty = updated[existingIndex].quantity + quantity;
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: newQty,
          };
          return updated;
        } else {
          return [
            ...prevItems,
            {
              id: itemId,
              product_id: product.id,
              product_name: product.name,
              unit_price: unitPrice,
              quantity,
              sauce_id: sauce ? sauce.id : null,
              sauce_name: sauce ? sauce.name : null,
            },
          ];
        }
      });

      const sauceDesc = sauce ? ` with ${sauce.name}` : ' (no sauce)';
      announce(
        `Added ${quantity} ${product.name}${sauceDesc} to order. Total ${formatNaira(
          unitPrice * quantity
        )}.`
      );
    },
    [announce]
  );

  const updateQuantity = useCallback(
    (itemId: string, newQuantity: number) => {
      if (newQuantity <= 0) {
        removeItem(itemId);
        return;
      }

      setItems((prevItems) =>
        prevItems.map((item) => {
          if (item.id === itemId) {
            announce(`Updated ${item.product_name} quantity to ${newQuantity}`);
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
      );
    },
    [announce]
  );

  const removeItem = useCallback(
    (itemId: string) => {
      setItems((prevItems) => {
        const itemToRemove = prevItems.find((i) => i.id === itemId);
        if (itemToRemove) {
          announce(`Removed ${itemToRemove.product_name} from order`);
        }
        return prevItems.filter((item) => item.id !== itemId);
      });
    },
    [announce]
  );

  const clearCart = useCallback(() => {
    setItems([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch {}
  }, []);

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        totalCount,
        subtotal,
        isLoaded,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
