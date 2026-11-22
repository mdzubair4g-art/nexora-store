import React from 'react';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  'Mobiles & Tablets',
  'Laptops & Audio',
  'Fashion & Sneakers',
  'Home & Kitchen',
  'Beauty & Grooming',
  'Fitness & Sports',
  'Books & Desk',
  'Gaming & Consoles'
];

export function CategoryBar({
  selectedCategory,
  onSelectCategory,
  onSelectFlashDeals,
  onOpenSeller
}) {
  const { user } = useAuth();
  return (
    <nav className="sub-bar text-slate-200 text-xs px-4 md:px-6 py-2 flex items-center gap-4 overflow-x-auto no-scrollbar border-t border-white/5">
      <button
        type="button"
        onClick={() => onSelectCategory('All')}
        className={`font-bold hover:text-cyan-300 whitespace-nowrap transition ${
          selectedCategory === 'All' ? 'text-cyan-300' : 'text-white'
        }`}
      >
        <i className="fa-solid fa-table-cells-large mr-1.5"></i>All Collections
      </button>

      <button
        type="button"
        onClick={onSelectFlashDeals}
        className="text-amber-300 font-bold hover:underline whitespace-nowrap transition"
      >
        <i className="fa-solid fa-bolt mr-1"></i>Flash Deals
      </button>

      {CATEGORIES.map(cat => (
        <button
          type="button"
          key={cat}
          onClick={() => onSelectCategory(cat)}
          className={`hover:text-cyan-300 whitespace-nowrap transition ${
            selectedCategory === cat ? 'text-cyan-300 font-bold' : 'text-slate-200'
          }`}
        >
          {cat}
        </button>
      ))}

      {user?.role === 'admin' && <button
        type="button"
        onClick={onOpenSeller}
        className="ml-auto bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 px-3 py-0.5 rounded-full font-bold hover:bg-cyan-500/30 whitespace-nowrap transition"
      >
        + Seller Studio
      </button>}
    </nav>
  );
}
