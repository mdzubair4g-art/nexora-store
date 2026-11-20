import React from 'react';
import { ProductCard } from './ProductCard';

export function ProductCatalog({
  catalogTitle,
  products = [],
  priceFilter,
  onChangePriceFilter,
  sortSelect,
  onChangeSort,
  onOpenProductDetail
}) {
  return (
    <main id="catalogAnchor" className="max-w-[1440px] mx-auto px-3 md:px-6 py-6">
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        {/* Catalog Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-5">
          <div>
            <h2 className="text-xl font-black text-slate-900">{catalogTitle}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing {products.length} curated items
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={priceFilter}
              onChange={(e) => onChangePriceFilter(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold bg-slate-50 outline-none cursor-pointer"
            >
              <option value="all">All Prices</option>
              <option value="under2000">Under ₹2,000</option>
              <option value="2000to10000">₹2,000 – ₹10,000</option>
              <option value="above10000">Above ₹10,000</option>
            </select>

            <select
              value={sortSelect}
              onChange={(e) => onChangeSort(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold bg-slate-50 outline-none cursor-pointer"
            >
              <option value="featured">Sort: Featured</option>
              <option value="low">Price: Low to High</option>
              <option value="high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-sm">
            <i className="fa-solid fa-box-open text-4xl text-slate-300 block mb-3"></i>
            No products match the selected filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                onOpenDetail={onOpenProductDetail}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
