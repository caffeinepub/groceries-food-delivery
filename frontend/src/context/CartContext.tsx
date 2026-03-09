import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Product } from '../backend';

export interface CartItem {
  product: Product;
  quantity: number;
  totalPrice: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: bigint) => void;
  updateQuantity: (productId: bigint, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'quick-groceries-cart';

function serializeCart(items: CartItem[]): string {
  return JSON.stringify(items.map(item => ({
    ...item,
    product: {
      ...item.product,
      id: item.product.id.toString(),
      price: item.product.price.toString(),
      categoryId: item.product.categoryId.toString(),
      discount: item.product.discount !== undefined ? item.product.discount.toString() : undefined,
    }
  })));
}

function deserializeCart(data: string): CartItem[] {
  try {
    const parsed = JSON.parse(data);
    return parsed.map((item: any) => ({
      ...item,
      product: {
        ...item.product,
        id: BigInt(item.product.id),
        price: BigInt(item.product.price),
        categoryId: BigInt(item.product.categoryId),
        discount: item.product.discount !== undefined ? BigInt(item.product.discount) : undefined,
      }
    }));
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = sessionStorage.getItem(CART_STORAGE_KEY);
      return stored ? deserializeCart(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(CART_STORAGE_KEY, serializeCart(items));
    } catch {
      // ignore
    }
  }, [items]);

  const addItem = useCallback((product: Product) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + 1, totalPrice: (i.quantity + 1) * Number(product.price) }
            : i
        );
      }
      return [...prev, { product, quantity: 1, totalPrice: Number(product.price) }];
    });
  }, []);

  const removeItem = useCallback((productId: bigint) => {
    setItems(prev => prev.filter(i => i.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: bigint, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(i => i.product.id !== productId));
      return;
    }
    setItems(prev =>
      prev.map(i =>
        i.product.id === productId
          ? { ...i, quantity, totalPrice: quantity * Number(i.product.price) }
          : i
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.totalPrice, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
