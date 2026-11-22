import React from 'react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

export function ProductCard({ product, onOpenDetail, onOpenAuth, isCompared = false, onToggleCompare }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { isWished, toggleWishlist } = useWishlist();

  const price = Number(product.price) || 0;
  const mrp = Number(product.mrp) || 0;
  const off = mrp > price && mrp > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const wished = isWished(product.id);
  const rating = Number(product.rating);
  const reviewsCount = Number(product.reviewsCount) || 0;

  return (
    <article className="group relative flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-4 transition duration-200 hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-lg">
      <button
        type="button"
        onClick={() => {
          if (!user) {
            onOpenAuth?.();
            return;
          }
          toggleWishlist(product.id);
        }}
        aria-label={wished ? 'Remove ' + product.title + ' from wishlist' : 'Add ' + product.title + ' to wishlist'}
        aria-pressed={wished}
        className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-sm transition hover:bg-rose-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500"
      >
        <i className={(wished ? 'fa-solid text-rose-500' : 'fa-regular text-slate-400') + ' fa-heart text-sm'} aria-hidden="true"></i>
      </button>

      <button
        type="button"
        onClick={() => onOpenDetail(product)}
        className="w-full cursor-pointer text-left focus-visible:rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600"
        aria-label={'View details for ' + product.title}
      >
        <div className="relative mb-3 flex h-44 items-center justify-center overflow-hidden rounded-xl bg-slate-50 p-3">
          {product.flashDeal && (
            <span className="absolute left-2 top-2 z-10 rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-extrabold text-white">
              Demo deal
            </span>
          )}
          <img
            src={product.image || '/nexora-placeholder.svg'}
            alt={product.title || 'NEXORA sample product'}
            loading="lazy"
            decoding="async"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = '/nexora-placeholder.svg';
            }}
            className="max-h-full max-w-full object-contain transition duration-300 group-hover:scale-105"
          />
        </div>

        <div className="flex items-center justify-between gap-2 text-[11px]">
          <span className="truncate font-bold text-cyan-700">{product.brand}</span>
          <span className="max-w-[120px] truncate text-slate-400">{product.category}</span>
        </div>

        <h3 className="mt-1 line-clamp-2 text-sm font-bold text-slate-900 group-hover:text-indigo-700">
          {product.title}
        </h3>

        <div className="mt-1.5 flex items-center gap-1.5 text-xs">
          {Number.isFinite(rating) && rating > 0 ? (
            <span className="flex items-center gap-1 rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-extrabold text-white">
              <span aria-hidden="true">★</span> {rating.toFixed(1)}
            </span>
          ) : (
            <span className="text-[11px] text-slate-400">No rating yet</span>
          )}
          <span className="text-[11px] text-slate-400">({reviewsCount.toLocaleString('en-IN')} sample reviews)</span>
        </div>

        <div className="mt-2.5 flex flex-wrap items-baseline gap-1.5">
          <span className="text-lg font-black text-slate-900">₹{price.toLocaleString('en-IN')}</span>
          {mrp > price && (
            <span className="text-xs text-slate-400 line-through">₹{mrp.toLocaleString('en-IN')}</span>
          )}
          {off > 0 && <span className="text-xs font-extrabold text-emerald-600">{off}% off</span>}
        </div>
      </button>

      <div className="mt-3.5 flex items-center gap-2">
        <button
          type="button"
          onClick={() => addToCart(product)}
          disabled={Number(product.stock) <= 0}
          className="btn-primary min-w-0 flex-1 rounded-xl py-2.5 text-xs font-bold shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          {Number(product.stock) <= 0 ? 'Out of stock' : 'Add to Bag'}
        </button>
        <button
          type="button"
          onClick={() => onToggleCompare?.(product)}
          aria-pressed={isCompared}
          aria-label={(isCompared ? 'Remove ' : 'Add ') + product.title + ' ' + (isCompared ? 'from' : 'to') + ' comparison'}
          title={isCompared ? 'Remove from comparison' : 'Compare this product'}
          className={(isCompared
            ? 'border-cyan-600 bg-cyan-50 text-cyan-800'
            : 'border-slate-200 bg-white text-slate-600 hover:border-cyan-400 hover:text-cyan-700') +
            ' flex shrink-0 items-center gap-1 rounded-xl border px-2.5 py-2.5 text-[11px] font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600'}
        >
          <i className="fa-solid fa-scale-balanced" aria-hidden="true"></i>
          {isCompared ? 'Added' : 'Compare'}
        </button>
      </div>
    </article>
  );
}
