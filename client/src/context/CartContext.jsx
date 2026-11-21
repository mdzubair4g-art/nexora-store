import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('nx_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [coupon, setCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('nx_cart', JSON.stringify(cart));
  }, [cart]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const finalTotal = Math.max(0, subtotal - couponDiscount);
  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const addToCart = (product, variant = null, qty = 1) => {
    const chosenVariant = variant || (product.variants && product.variants[0]) || 'Standard';
    setCart(prev => {
      const existingIdx = prev.findIndex(item => item.id === product.id && item.variant === chosenVariant);
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx].qty += qty;
        return copy;
      } else {
        return [...prev, {
          id: product.id,
          title: product.title,
          brand: product.brand,
          price: product.price,
          mrp: product.mrp,
          image: product.image,
          variant: chosenVariant,
          qty
        }];
      }
    });
    setIsCartOpen(true);
  };

  const updateQty = (index, delta) => {
    setCart(prev => {
      const copy = [...prev];
      copy[index].qty = Math.min(20, Math.max(0, copy[index].qty + delta));
      if (copy[index].qty === 0) {
        copy.splice(index, 1);
      }
      return copy;
    });
  };

  const removeFromCart = (index) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setCart([]);
    setCoupon(null);
    setCouponDiscount(0);
    setCouponMessage('');
  };

  const applyCouponCode = async (code) => {
    if (!code || !code.trim()) {
      setCoupon(null);
      setCouponDiscount(0);
      setCouponMessage('');
      return;
    }
    try {
      const res = await api.applyCoupon(code, subtotal);
      setCoupon(res.code);
      setCouponDiscount(res.discountAmount);
      setCouponMessage(res.message);
      return res;
    } catch (err) {
      setCoupon(null);
      setCouponDiscount(0);
      setCouponMessage(err.message);
      throw err;
    }
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      updateQty,
      removeFromCart,
      clearCart,
      subtotal,
      finalTotal,
      itemCount,
      coupon,
      couponDiscount,
      couponMessage,
      applyCouponCode,
      isCartOpen,
      setIsCartOpen
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
