import React from 'react';

export function RecentlyViewed({ products = [], onOpenProduct, onClear }) {
  if (!products.length) return null;

  return (
    <section className="mx-auto mt-6 max-w-[1440px] px-3 md:px-6" aria-labelledby="recentlyViewedHeading">
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 id="recentlyViewedHeading" className="text-lg font-black text-slate-900">Recently viewed</h2>
            <p className="mt-0.5 text-xs text-slate-500">Pick up where you left off on this device.</p>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="rounded-lg px-3 py-2 text-xs font-bold text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
          >
            Clear history
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {products.map(product => (
            <button
              type="button"
              key={product.id}
              onClick={() => onOpenProduct(product)}
              className="min-w-0 rounded-xl border border-slate-100 p-3 text-left transition hover:border-cyan-300 hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600"
            >
              <div className="mb-2 flex h-24 items-center justify-center rounded-lg bg-slate-50 p-2">
                <img
                  src={product.image || '/nexora-placeholder.svg'}
                  alt=""
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = '/nexora-placeholder.svg';
                  }}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <span className="block truncate text-[10px] font-bold uppercase tracking-wide text-cyan-700">{product.brand}</span>
              <span className="mt-1 line-clamp-2 block min-h-8 text-xs font-semibold text-slate-800">{product.title}</span>
              <span className="mt-1 block text-sm font-black text-slate-900">₹{Number(product.price || 0).toLocaleString('en-IN')}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
