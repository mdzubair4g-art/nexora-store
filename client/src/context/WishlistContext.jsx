import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  const userEmail = user?.email || null;

  const refreshWishlist = async () => {
    if (!userEmail) { setWishlistIds([]); setWishlistItems([]); return; }
    try {
      const data = await api.getWishlist(userEmail);
      setWishlistIds(data.productIds || []);
      setWishlistItems(data.items || []);
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    }
  };

  useEffect(() => {
    refreshWishlist();
  }, [userEmail]);

  const toggleWishlist = async (productId) => {
    if (!user) { console.info('Sign in to save wishlist items.'); return; }
    try {
      const res = await api.toggleWishlist(userEmail, productId);
      setWishlistIds(res.productIds);
      await refreshWishlist();
    } catch (err) {
      console.error('Wishlist toggle error:', err);
    }
  };

  const isWished = (id) => wishlistIds.includes(Number(id));

  return (
    <WishlistContext.Provider value={{
      wishlistIds,
      wishlistItems,
      toggleWishlist,
      refreshWishlist,
      isWished,
      isWishlistOpen,
      setIsWishlistOpen
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
