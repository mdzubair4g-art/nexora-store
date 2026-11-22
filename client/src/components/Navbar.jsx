import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export function Navbar({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  deliveryLocation,
  onChangeLocation,
  onOpenAuth,
  onOpenOrders,
  onOpenSeller,
  onToggleServerDrawer
}) {
  const { user } = useAuth();
  const { itemCount, setIsCartOpen } = useCart();
  const { wishlistIds, setIsWishlistOpen } = useWishlist();

  return (
    <header className="nav-glass text-white sticky top-0 z-40 shadow-lg border-b border-indigo-900/50">
      <div className="max-w-[1440px] mx-auto px-3 md:px-6 py-2.5 flex flex-wrap items-center gap-3">
        {/* Brand Logo */}
        <button
          onClick={() => { onSelectCategory('All'); onSearchChange(''); }}
          className="flex items-center gap-2.5 px-2 py-1 rounded-xl hover:bg-white/10 transition text-left"
        >
          <svg width="36" height="36" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="nxGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#f97316" />
              </linearGradient>
            </defs>
            <rect x="2" y="2" width="36" height="36" rx="10" fill="url(#nxGrad)" />
            <path d="M12 27V13L21 27V13" stroke="#0f172a" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M24 15L30 25M30 15L24 25" stroke="#ffffff" strokeWidth="2.8" strokeLinecap="round" />
          </svg>
          <div>
            <div className="text-xl font-black tracking-wider leading-none">
              NEXORA<span className="text-cyan-400 text-xs font-bold">.in</span>
            </div>
            <div className="text-[10px] text-slate-300 tracking-widest uppercase font-medium">Curated Marketplace</div>
          </div>
        </button>

        {/* Location Selector */}
        <button
          onClick={onChangeLocation}
          className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition"
        >
          <i className="fa-solid fa-location-dot text-cyan-400"></i>
          <div>
            <div className="text-[10px] text-slate-300 leading-tight">Location preference</div>
            <div className="text-xs font-bold leading-tight">{deliveryLocation}</div>
          </div>
        </button>

        {/* Search Bar */}
        <form
          onSubmit={onSearchSubmit}
          className="flex-1 flex min-w-[220px] h-10 rounded-xl overflow-hidden bg-white shadow-inner focus-within:ring-2 focus-within:ring-cyan-400"
        >
          <select
            value={selectedCategory}
            onChange={(e) => onSelectCategory(e.target.value)}
            className="bg-slate-100 text-slate-800 text-xs font-semibold px-3 border-r border-slate-200 outline-none cursor-pointer"
          >
            <option value="All">All Departments</option>
            <option value="Mobiles & Tablets">Mobiles & Tablets</option>
            <option value="Laptops & Audio">Laptops & Audio</option>
            <option value="Fashion & Sneakers">Fashion & Sneakers</option>
            <option value="Home & Kitchen">Home & Kitchen</option>
            <option value="Beauty & Grooming">Beauty & Grooming</option>
            <option value="Fitness & Sports">Fitness & Sports</option>
            <option value="Books & Desk">Books & Desk</option>
            <option value="Gaming & Consoles">Gaming & Consoles</option>
          </select>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search 8 collections, brands, gadgets, sneakers..."
            className="flex-1 px-3.5 text-sm text-slate-900 outline-none"
          />
          <button type="submit" className="btn-primary px-4 font-bold text-sm">
            <i className="fa-solid fa-magnifying-glass"></i>
          </button>
        </form>

        {/* Header Right Actions */}
        <div className="flex items-center gap-1.5 md:gap-2">
          {/* Server status pill */}
          {user?.role === 'admin' && <button
            onClick={onToggleServerDrawer}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold hover:bg-emerald-500/25 transition"
            title="Open admin demo API inspector"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Admin: API Inspector</span>
          </button>}

          {/* Account */}
          <button
            onClick={onOpenAuth}
            className="px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-left transition"
          >
            <div className="text-[10px] text-slate-300 leading-tight">
              {user ? `Hi, ${user.name}` : 'Welcome, Guest'}
            </div>
            <div className="text-xs font-bold leading-tight">Account</div>
          </button>

          {/* Wishlist */}
          <button
            onClick={() => setIsWishlistOpen(true)}
            className="relative px-2.5 py-1.5 rounded-xl hover:bg-white/10 transition"
            title="View Wishlist"
          >
            <i className="fa-regular fa-heart text-lg text-rose-400"></i>
            <span className="absolute top-0.5 right-0.5 bg-rose-500 text-white text-[10px] font-extrabold px-1.5 rounded-full">
              {wishlistIds.length}
            </span>
          </button>

          {/* Track Orders */}
          <button
            onClick={onOpenOrders}
            className="hidden md:block px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-left transition"
          >
            <div className="text-[10px] text-slate-300 leading-tight">My</div>
            <div className="text-xs font-bold leading-tight">Order History</div>
          </button>

          {/* Bag */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 transition"
          >
            <i className="fa-solid fa-bag-shopping text-lg text-cyan-300"></i>
            <span className="bg-orange-500 text-white text-xs font-extrabold px-1.5 py-0.2 rounded-full">
              {itemCount}
            </span>
            <span className="hidden sm:inline text-xs font-bold">Bag</span>
          </button>
        </div>
      </div>
    </header>
  );
}
