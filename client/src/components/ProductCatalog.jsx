import React from 'react';
import { ProductCard } from './ProductCard';

export function ProductCatalog({
  catalogTitle,
  products = [],
  loading = false,
  error = '',
  onRetry,
  priceFilter,
  onChangePriceFilter,
  sortSelect,
  onChangeSort,
  onOpenProductDetail
}) {
  return (
    <main id="catalogAnchor" className="max-w-[1440px] mx-auto px-3 md:px-6 py-6">
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-5">
          <div>
            <h2 className="text-xl font-black text-slate-900">{catalogTitle}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {loading ? 'Updating catalogue…' : 'Showing ' + products.length + ' curated items'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <select
              value={priceFilter}
              onChange={(event) => onChangePriceFilter(event.target.value)}
              className="flex-1 sm:flex-none border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold bg-slate-50 outline-none cursor-pointer"
            >
              <option value="all">All Prices</option>
              <option value="under2000">Under ₹2,000</option>
              <option value="2000to10000">₹2,000 – ₹10,000</option>
              <option value="above10000">Above ₹10,000</option>
            </select>

            <select
              value={sortSelect}
              onChange={(event) => onChangeSort(event.target.value)}
              className="flex-1 sm:flex-none border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold bg-slate-50 outline-none cursor-pointer"
            >
              <option value="featured">Sort: Featured</option>
              <option value="low">Price: Low to High</option>
              <option value="high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5" aria-label="Loading products">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="rounded-2xl border border-slate-100 p-3 sm:p-4 animate-pulse">
                <div className="h-32 sm:h-44 rounded-xl bg-slate-100 mb-3"></div>
                <div className="h-3 bg-slate-100 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-slate-100 rounded w-4/5 mb-2"></div>
                <div className="h-4 bg-slate-100 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-14 px-4">
            <i className="fa-solid fa-cloud-arrow-down text-4xl text-slate-300 mb-3"></i>
            <h3 className="font-bold text-slate-800">We couldn’t load the catalogue</h3>
            <p className="text-sm text-slate-500 mt-1">{error}</p>
            <button type="button" onClick={onRetry} className="btn-cyan mt-4 rounded-xl px-5 py-2 text-xs font-bold">Try again</button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-sm">
            <i className="fa-solid fa-box-open text-4xl text-slate-300 block mb-3"></i>
            No products match the selected filters.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {products.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenDetail={onOpenProductDetail}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
