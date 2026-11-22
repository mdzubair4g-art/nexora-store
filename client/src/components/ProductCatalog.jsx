import React from 'react';
import { ProductCard } from './ProductCard';

function ProductSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 animate-pulse" aria-hidden="true">
      <div className="h-44 rounded-xl bg-slate-100 mb-4" />
      <div className="h-3 w-1/3 rounded bg-slate-100 mb-3" />
      <div className="h-4 w-4/5 rounded bg-slate-100 mb-2" />
      <div className="h-4 w-2/3 rounded bg-slate-100 mb-5" />
      <div className="h-9 rounded-xl bg-slate-100" />
    </div>
  );
}

export function ProductCatalog({
  catalogTitle,
  products = [],
  loading = false,
  error = '',
  onRetry,
  onClearFilters,
  onOpenAuth,
  priceFilter,
  onChangePriceFilter,
  sortSelect,
  onChangeSort,
  onOpenProductDetail,
  compareProducts = [],
  onToggleCompare
}) {
  return (
    <main id="catalogAnchor" className="max-w-[1440px] mx-auto px-3 md:px-6 py-6" aria-labelledby="catalogHeading">
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-5">
          <div>
            <h2 id="catalogHeading" className="text-xl font-black text-slate-900">{catalogTitle}</h2>
            <p className="text-xs text-slate-500 mt-0.5" aria-live="polite">
              {loading ? 'Updating catalogue…' : 'Showing ' + products.length + ' sample items'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor="priceFilter">Filter by price</label>
            <select
              id="priceFilter"
              value={priceFilter}
              onChange={(e) => onChangePriceFilter(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold bg-slate-50 outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-500"
            >
              <option value="all">All Prices</option>
              <option value="under2000">Under ₹2,000</option>
              <option value="2000to10000">₹2,000 – ₹10,000</option>
              <option value="above10000">Above ₹10,000</option>
            </select>

            <label className="sr-only" htmlFor="sortProducts">Sort products</label>
            <select
              id="sortProducts"
              value={sortSelect}
              onChange={(e) => onChangeSort(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold bg-slate-50 outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-500"
            >
              <option value="featured">Sort: Featured</option>
              <option value="low">Price: Low to High</option>
              <option value="high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {error ? (
          <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-8 text-center">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white text-rose-600">
              <i className="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
            </div>
            <h3 className="font-bold text-slate-900">Catalogue unavailable</h3>
            <p className="mx-auto mt-1 max-w-md text-sm text-slate-600">{error}</p>
            <button
              type="button"
              onClick={onRetry}
              className="mt-4 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600"
            >
              Try again
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5" aria-label="Loading products">
            {Array.from({ length: 8 }, (_, index) => <ProductSkeleton key={index} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-sm">
            <i className="fa-solid fa-box-open text-4xl text-slate-300 block mb-3" aria-hidden="true"></i>
            <h3 className="font-bold text-slate-800">No matching products</h3>
            <p className="mt-1">Try another search or clear your filters.</p>
            <button
              type="button"
              onClick={onClearFilters}
              className="mt-4 rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenDetail={onOpenProductDetail}
                onOpenAuth={onOpenAuth}
                isCompared={compareProducts.some(item => Number(item.id) === Number(product.id))}
                onToggleCompare={onToggleCompare}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
