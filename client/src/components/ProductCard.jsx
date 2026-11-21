import React from 'react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export function ProductCard({ product, onOpenDetail }) {
  const { addToCart } = useCart();
  const { isWished, toggleWishlist } = useWishlist();

  const off = Math.round(((product.mrp - product.price) / product.mrp) * 100);
  const wished = isWished(product.id);

  return (
    <div className="group border border-slate-100 rounded-2xl p-4 flex flex-col justify-between bg-white hover:shadow-lg hover:border-cyan-200 transition relative">
      {/* Wishlist Heart Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleWishlist(product.id);
        }}
        className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 shadow hover:bg-white flex items-center justify-center transition"
        title={wished ? 'Remove from wishlist' : 'Save to wishlist'}
        aria-label={wished ? 'Remove from wishlist' : 'Save to wishlist'}
      >
        <i className={`${wished ? 'fa-solid text-rose-500' : 'fa-regular text-slate-400'} fa-heart text-sm`}></i>
      </button>

      {/* Product Image and Meta */}
      <div
        role="button"
        tabIndex={0}
        aria-label={'View details for ' + product.title}
        onClick={() => onOpenDetail(product)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onOpenDetail(product);
          }
        }}
        className="cursor-pointer"
      >
        <div className="h-44 bg-slate-50 rounded-xl flex items-center justify-center p-3 mb-3 overflow-hidden relative">
          {product.flashDeal && (
            <span className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full z-10">
              Flash Deal
            </span>
          )}
          <img
            src={product.image}
            alt={product.title}
            className="max-h-full object-contain group-hover:scale-105 transition duration-300"
          />
        </div>

        <div className="flex items-center justify-between text-[11px]">
          <span className="font-bold text-cyan-700">{product.brand}</span>
          <span className="text-slate-400 truncate max-w-[120px]">{product.category}</span>
        </div>

        <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 line-clamp-2 mt-1">
          {product.title}
        </h3>

        <div className="flex items-center gap-1.5 text-xs mt-1.5">
          <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded flex items-center gap-1">
            <span>★</span> {product.rating}
          </span>
          <span className="text-slate-400 text-[11px]">
            ({product.reviewsCount?.toLocaleString('en-IN')})
          </span>
        </div>

        <div className="mt-2.5 flex items-baseline gap-1.5">
          <span className="text-lg font-black text-slate-900">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          <span className="text-xs text-slate-400 line-through">
            ₹{product.mrp.toLocaleString('en-IN')}
          </span>
          {off > 0 && (
            <span className="text-xs font-extrabold text-emerald-600">
              {off}% off
            </span>
          )}
        </div>
      </div>

      {/* Add to Bag Button */}
      <button
        onClick={() => addToCart(product)}
        className="mt-3.5 w-full btn-primary py-2 rounded-xl text-xs font-bold shadow-sm"
      >
        Add to Bag
      </button>
    </div>
  );
}
