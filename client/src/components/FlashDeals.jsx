import React from 'react';

export function FlashDeals({ deals = [], onOpenProductDetail }) {
  const flashItems = deals.slice(0, 4);

  return (
    <section className="max-w-[1440px] mx-auto px-3 md:px-6 pt-5" aria-labelledby="featuredPicksHeading">
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-4 text-white shadow-md md:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-full bg-orange-500 px-3 py-1 text-xs font-black uppercase text-white">
              <i className="fa-solid fa-bolt" aria-hidden="true"></i> Featured
            </span>
            <h2 id="featuredPicksHeading" className="text-base font-extrabold md:text-lg">Featured Sample Picks</h2>
          </div>
          <span className="text-xs text-slate-300">Demo catalogue · No timed offers</span>
        </div>

        {flashItems.length === 0 ? (
          <p className="rounded-xl border border-white/10 bg-white/5 p-5 text-center text-xs text-slate-300">
            No featured sample products are available in this category right now.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {flashItems.map(product => {
              const price = Number(product.price) || 0;
              const mrp = Number(product.mrp) || 0;
              const off = mrp > price && mrp > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0;
              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => onOpenProductDetail(product)}
                  className="group flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 p-3 text-left transition hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                  aria-label={`View sample details for ${product.title}`}
                >
                  <img
                    src={product.image || '/nexora-placeholder.svg'}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = '/nexora-placeholder.svg';
                    }}
                    className="h-16 w-16 shrink-0 rounded-lg bg-white p-1 object-contain transition group-hover:scale-105"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="inline-block rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-extrabold text-white">
                      {off > 0 ? `${off}% sample markdown` : 'Sample listing'}
                    </span>
                    <span className="mt-1 block truncate text-xs font-bold text-white">{product.title}</span>
                    <span className="mt-0.5 block">
                      <span className="text-sm font-black text-cyan-300">₹{price.toLocaleString('en-IN')}</span>
                      {mrp > price && <span className="ml-1.5 text-[11px] text-slate-400 line-through">₹{mrp.toLocaleString('en-IN')}</span>}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
