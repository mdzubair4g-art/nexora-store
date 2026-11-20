import React, { useState, useEffect } from 'react';

export function FlashDeals({ deals = [], onOpenProductDetail }) {
  const [dealSeconds, setDealSeconds] = useState(17999);

  useEffect(() => {
    const timer = setInterval(() => {
      setDealSeconds(prev => (prev > 0 ? prev - 1 : 17999));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = String(Math.floor(dealSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((dealSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(dealSeconds % 60).padStart(2, '0');

  const flashItems = deals.slice(0, 4);

  return (
    <section className="max-w-[1440px] mx-auto px-3 md:px-6 pt-5">
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-4 md:p-5 text-white shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-3">
            <span className="bg-orange-500 text-white text-xs font-black px-3 py-1 rounded-full uppercase flex items-center gap-1.5">
              <i className="fa-solid fa-bolt"></i>Flash Deals
            </span>
            <h2 className="text-base md:text-lg font-extrabold">Lightning Picks Under ₹4,999</h2>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-300">Ends in:</span>
            <span className="font-mono font-extrabold bg-white/10 px-2.5 py-1 rounded-lg text-cyan-300">
              {hours}:{minutes}:{seconds}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {flashItems.map(p => {
            const off = Math.round(((p.mrp - p.price) / p.mrp) * 100);
            return (
              <div
                key={p.id}
                onClick={() => onOpenProductDetail(p)}
                className="bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl p-3 flex items-center gap-3 cursor-pointer transition group"
              >
                <img
                  src={p.image}
                  alt={p.title}
                  className="w-16 h-16 rounded-lg object-contain bg-white shrink-0 p-1 group-hover:scale-105 transition"
                />
                <div className="min-w-0 flex-1">
                  <span className="bg-rose-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    {off}% OFF
                  </span>
                  <div className="text-xs font-bold text-white truncate mt-1">
                    {p.title}
                  </div>
                  <div className="mt-0.5">
                    <span className="text-sm font-black text-cyan-300">
                      ₹{p.price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] text-slate-400 line-through ml-1.5">
                      ₹{p.mrp.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
