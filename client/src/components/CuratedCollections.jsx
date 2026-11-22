import React from 'react';

const COLLECTIONS = [
  {
    tag: 'Curated Edit',
    tagColor: 'text-cyan-700 bg-cyan-50',
    title: 'Work From Home Studio',
    name: 'Work From Home Setup',
    img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80',
    desc: 'Ultrabooks, mechanical keyboards, desk lamps & ergonomic essentials.'
  },
  {
    tag: 'Trending Drop',
    tagColor: 'text-orange-700 bg-orange-50',
    title: 'Streetwear & Sneakers',
    name: 'Streetwear & Sneakers',
    img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80',
    desc: 'Performance runners, polarized shades, chronograph watches & backpacks.'
  },
  {
    tag: 'Home Upgrade',
    tagColor: 'text-emerald-700 bg-emerald-50',
    title: 'Smart Home & Kitchen',
    name: 'Smart Home & Kitchen',
    img: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=500&q=80',
    desc: 'Air fryers, espresso brewers, mixer grinders & smart ambient lighting.'
  },
  {
    tag: 'Active & Play',
    tagColor: 'text-purple-700 bg-purple-50',
    title: 'Pro Gaming & Fitness',
    name: 'Pro Gaming & Fitness',
    img: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500&q=80',
    desc: 'Wireless controllers, RGB headsets, dumbbells & yoga gear.'
  }
];

export function CuratedCollections({ onSelectCollection }) {
  return (
    <section className="max-w-[1440px] mx-auto px-3 md:px-6 pt-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {COLLECTIONS.map(col => (
          <button
            type="button"
            key={col.title}
            onClick={() => onSelectCollection(col.name)}
            aria-label={`Browse ${col.title} collection`}
            className="w-full text-left bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md hover:border-cyan-200 transition group focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600"
          >
            <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${col.tagColor}`}>
              {col.tag}
            </span>
            <h3 className="font-extrabold text-base mt-2 mb-2 group-hover:text-indigo-600 transition">
              {col.title}
            </h3>
            <div className="overflow-hidden rounded-xl mb-2">
              <img
                src={col.img}
                alt={col.title}
                className="w-full h-40 object-cover group-hover:scale-105 transition duration-500"
              />
            </div>
            <p className="text-xs text-slate-500 line-clamp-2">
              {col.desc}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}
