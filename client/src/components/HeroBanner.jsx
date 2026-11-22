import React, { useState, useEffect } from 'react';

const HERO_SLIDES = [
  {
    badge: "Interactive Marketplace Demo",
    title: "Explore Tech, Audio & Everyday Essentials",
    subtitle: "Browse sample listings, compare products, and save your favourites to a personal wishlist.",
    img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
    bg: "from-[#0f172a] via-[#1e1b4b] to-[#0e7490]"
  },
  {
    badge: "Gaming & Fitness Picks",
    title: "Build Your Setup. Find Your Next Favourite.",
    subtitle: "Explore example products with category filters, search, and detailed product views.",
    img: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600&q=80",
    bg: "from-[#111827] via-[#311042] to-[#be185d]"
  },
  {
    badge: "Home & Lifestyle",
    title: "A Curated Space for Everyday Discoveries",
    subtitle: "Try cart management and a clearly labelled simulated checkout. No real payment is taken.",
    img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
    bg: "from-[#064e3b] via-[#0f766e] to-[#0284c7]"
  }
];

export function HeroBanner({ onShopFlashDeals, onExploreCatalog }) {
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex(prev => (prev + 1) % HERO_SLIDES.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[slideIndex];

  return (
    <section className="max-w-[1440px] mx-auto px-3 md:px-6 pt-4">
      <div className="relative rounded-2xl overflow-hidden shadow-md">
        <div
          className={`min-h-[250px] md:min-h-[320px] bg-gradient-to-r ${slide.bg} text-white p-6 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-700`}
        >
          <div className="max-w-xl space-y-3">
            <span className="inline-block bg-cyan-400 text-slate-950 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              {slide.badge}
            </span>
            <h1 className="text-2xl md:text-4xl font-black leading-tight">
              {slide.title}
            </h1>
            <p className="text-xs md:text-sm text-slate-200">
              {slide.subtitle}
            </p>
            <div className="pt-1 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onShopFlashDeals}
                className="btn-primary px-5 py-2.5 rounded-xl font-bold text-xs shadow"
              >
                Browse Featured Picks
              </button>
              <button
                type="button"
                onClick={onExploreCatalog}
                className="bg-white/15 hover:bg-white/25 border border-white/20 px-5 py-2.5 rounded-xl font-bold text-xs transition"
              >
                Explore Catalogue
              </button>
            </div>
          </div>
          <div className="hidden md:flex items-center justify-center">
            <img
              src={slide.img}
              alt="Featured showcase"
              className="w-64 h-52 object-cover rounded-2xl shadow-2xl border-2 border-white/20"
            />
          </div>
        </div>

        {/* Carousel Prev/Next Buttons */}
        <button
          type="button"
          aria-label="Previous featured slide"
          onClick={() => setSlideIndex(prev => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
          className="absolute left-3 top-1/2 -translate-y-1/2 bg-slate-950/40 hover:bg-slate-950/70 text-white w-9 h-9 rounded-full flex items-center justify-center transition"
        >
          <i className="fa-solid fa-chevron-left text-xs"></i>
        </button>
        <button
          type="button"
          aria-label="Next featured slide"
          onClick={() => setSlideIndex(prev => (prev + 1) % HERO_SLIDES.length)}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-950/40 hover:bg-slate-950/70 text-white w-9 h-9 rounded-full flex items-center justify-center transition"
        >
          <i className="fa-solid fa-chevron-right text-xs"></i>
        </button>
      </div>
    </section>
  );
}
