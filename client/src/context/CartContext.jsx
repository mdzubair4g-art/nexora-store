import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const CartContext = createContext();

function readSavedCart() {
  try {
    const saved = JSON.parse(localStorage.getItem('nx_cart') || '[]');
    if (!Array.isArray(saved)) return [];
    return saved
      .filter(item => item && Number.isSafeInteger(Number(item.id)) && Number(item.id) > 0 &&
        Number.isFinite(Number(item.price)) && Number(item.price) >= 0 &&
        Number.isInteger(Number(item.qty)) && Number(item.qty) > 0 && Number(item.qty) <= 25)
      .slice(0, 25)
      .map(item => ({
        ...item,
        id: Number(item.id),
        price: Number(item.price),
        mrp: Number(item.mrp) || Number(item.price),
        qty: Number(item.qty),
        stock: Number.isInteger(Number(item.stock)) ? Math.max(0, Number(item.stock)) : 25,
        title: String(item.title || 'Product').slice(0, 160),
        brand: String(item.brand || '').slice(0, 80),
        image: typeof item.image === 'string' ? item.image : '',
        variant: String(item.variant || 'Standard').slice(0, 80)
      }));
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(readSavedCart);
  const [coupon, setCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('nx_cart', JSON.stringify(cart));
    } catch (error) {
      console.warn('The shopping cart could not be saved on this device.');
    }
  }, [cart]);

  const subtotal = cart.reduce((sum, item) => sum + Number(item.price) * Number(item.qty), 0);
  const finalTotal = Math.max(0, subtotal - couponDiscount);
  const itemCount = cart.reduce((sum, item) => sum + Number(item.qty), 0);

  const invalidateCoupon = () => {
    setCoupon(null);
    setCouponDiscount(0);
    setCouponMessage('');
  };

  const addToCart = (product, variant = null, qty = 1) => {
    const productId = Number(product?.id);
    const price = Number(product?.price);
    const stock = Number.isInteger(Number(product?.stock)) ? Math.max(0, Number(product.stock)) : 25;
    const safeQty = Number.isInteger(Number(qty)) ? Math.min(25, Math.max(1, Number(qty))) : 1;
    if (!Number.isSafeInteger(productId) || productId <= 0 || !Number.isFinite(price) || price < 0 || stock <= 0) return;

    const chosenVariant = String(variant || (product.variants && product.variants[0]) || 'Standard').slice(0, 80);
    invalidateCoupon();
    setCart(prev => {
      const existingIdx = prev.findIndex(item => item.id === productId && item.variant === chosenVariant);
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = {
          ...copy[existingIdx],
          stock,
          qty: Math.min(25, stock, copy[existingIdx].qty + safeQty)
        };
        return copy;
      }
      if (prev.length >= 25) return prev;
      return [...prev, {
        id: productId,
        title: String(product.title || 'Product').slice(0, 160),
        brand: String(product.brand || '').slice(0, 80),
        price,
        mrp: Number(product.mrp) || price,
        image: typeof product.image === 'string' ? product.image : '',
        variant: chosenVariant,
        qty: Math.min(safeQty, stock),
        stock
      }];
    });
    setIsCartOpen(true);
  };

  const updateQty = (index, delta) => {
    if (!Number.isInteger(index) || !Number.isInteger(delta) || ![-1, 1].includes(delta)) return;
    setCart(prev => {
      if (!prev[index]) return prev;
      const copy = [...prev];
      const nextQty = copy[index].qty + delta;
      if (nextQty <= 0) copy.splice(index, 1);
      else copy[index] = { ...copy[index], qty: Math.min(nextQty, 25, copy[index].stock || 25) };
      return copy;
    });
    invalidateCoupon();
  };

  const removeFromCart = (index) => {
    if (!Number.isInteger(index) || index < 0) return;
    setCart(prev => prev.filter((_, i) => i !== index));
    invalidateCoupon();
  };

  const clearCart = () => {
    setCart([]);
    invalidateCoupon();
  };

  const applyCouponCode = async (code) => {
    if (!code || !code.trim()) {
      invalidateCoupon();
      return null;
    }
    try {
      const res = await api.applyCoupon(code, subtotal);
      setCoupon(res.code);
      setCouponDiscount(Number(res.discountAmount) || 0);
      setCouponMessage(res.message || 'Coupon applied.');
      return res;
    } catch (err) {
      invalidateCoupon();
      setCouponMessage(err.message || 'Invalid coupon');
      throw err;
    }
  };

  return (
    <CartContext.Provider value={{
      cart, addToCart, updateQty, removeFromCart, clearCart,
      subtotal, finalTotal, itemCount, coupon, couponDiscount,
      couponMessage, applyCouponCode, isCartOpen, setIsCartOpen
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
