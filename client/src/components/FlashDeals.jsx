import React from 'react';

export function FlashDeals({ deals = [], onOpenProductDetail }) {
  const flashItems = deals.slice(0, 4);

  return (
    <section className="max-w-[1440px] mx-auto px-3 md:px-6 pt-5">
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-4 md:p-5 text-white shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-3">
            <span className="bg-orange-500 text-white text-xs font-black px-3 py-1 rounded-full uppercase flex items-center gap-1.5">
              <i className="fa-solid fa-bolt"></i>Featured deals
            </span>
            <h2 className="text-base md:text-lg font-extrabold">Curated offers on popular picks</h2>
          </div>
          <span className="text-xs text-cyan-200 bg-white/10 border border-white/10 rounded-full px-3 py-1">
            Prices shown at checkout
          </span>
        </div>

        {flashItems.length === 0 ? (
          <p className="text-sm text-slate-300 py-5 text-center">New offers are on the way.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {flashItems.map(product => {
              const discount = product.mrp > 0
                ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
                : 0;
              return (
                <button
                  type="button"
                  key={product.id}
                  onClick={() => onOpenProductDetail(product)}
                  className="text-left bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl p-3 flex items-center gap-3 transition group"
                >
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-16 h-16 rounded-lg object-contain bg-white shrink-0 p-1 group-hover:scale-105 transition"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="bg-rose-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                      {discount}% OFF
                    </span>
                    <span className="block text-xs font-bold text-white truncate mt-1">
                      {product.title}
                    </span>
                    <span className="block mt-0.5">
                      <span className="text-sm font-black text-cyan-300">
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[11px] text-slate-400 line-through ml-1.5">
                        ₹{product.mrp.toLocaleString('en-IN')}
                      </span>
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
