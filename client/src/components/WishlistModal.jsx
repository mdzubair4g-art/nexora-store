import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export function WishlistModal() {
  const { isWishlistOpen, setIsWishlistOpen, wishlistItems, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { user } = useAuth();

  if (!isWishlistOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
        <button
          onClick={() => setIsWishlistOpen(false)}
          className="absolute top-3 right-4 text-xl text-slate-400 hover:text-slate-600 transition"
        >
          &times;
        </button>

        <div className="flex items-center gap-2 mb-1">
          <i className="fa-solid fa-heart text-rose-500 text-lg"></i>
          <h3 className="text-xl font-black text-slate-900">Saved Wishlist</h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Items saved to your signed-in account.
        </p>

        <div className="flex-1 overflow-y-auto space-y-3">
          {wishlistItems.length === 0 ? (
            <div className="text-center text-slate-500 text-sm py-12">
              <i className="fa-regular fa-heart text-4xl text-slate-300 block mb-2"></i>
              {user ? 'Your wishlist is empty.' : 'Sign in to save and view your wishlist.'}
            </div>
          ) : (
            wishlistItems.map(p => (
              <div
                key={p.id}
                className="flex items-center gap-3 border border-slate-100 rounded-xl p-3 bg-slate-50/50"
              >
                <img
                  src={p.image}
                  alt={p.title}
                  className="w-14 h-14 object-contain bg-white rounded-lg p-1 border border-slate-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold truncate text-slate-900">
                    {p.title}
                  </div>
                  <div className="text-sm font-black text-slate-900 mt-0.5">
                    ₹{p.price.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      addToCart(p);
                      setIsWishlistOpen(false);
                    }}
                    className="btn-primary px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm whitespace-nowrap"
                  >
                    Move to Bag
                  </button>
                  <button
                    onClick={() => toggleWishlist(p.id)}
                    className="text-slate-400 hover:text-rose-500 p-1 text-sm transition"
                    title="Remove"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
