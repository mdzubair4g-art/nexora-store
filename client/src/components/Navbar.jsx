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
        {/* NEXORA brand mark and wordmark */}
        <button
          type="button"
          aria-label="Go to the NEXORA homepage"
          onClick={() => { onSelectCategory('All'); onSearchChange(''); }}
          className="flex items-center gap-2.5 px-2 py-1 rounded-xl hover:bg-white/10 transition text-left shrink-0"
        >
          <img
            src="/nexora-mark.svg"
            alt=""
            aria-hidden="true"
            width="40"
            height="40"
            className="w-9 h-9 shrink-0 drop-shadow-md"
          />
          <span className="block">
            <span className="block text-xl font-black tracking-wider leading-none">
              NEXORA<span className="text-cyan-400 text-xs font-bold">.in</span>
            </span>
            <span className="block text-[10px] text-slate-300 tracking-widest uppercase font-medium mt-1">
              Curated Marketplace
            </span>
          </span>
        </button>

        {/* Location Selector */}
        <button
          type="button"
          onClick={onChangeLocation}
          className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition"
        >
          <i className="fa-solid fa-location-dot text-cyan-400" aria-hidden="true"></i>
          <div>
            <div className="text-[10px] text-slate-300 leading-tight">Deliver to</div>
            <div className="text-xs font-bold leading-tight">{deliveryLocation}</div>
          </div>
        </button>

        {/* Search Bar */}
        <form
          onSubmit={onSearchSubmit}
          className="order-3 md:order-none w-full md:w-auto md:flex-1 flex min-w-0 md:min-w-[220px] h-10 rounded-xl overflow-hidden bg-white shadow-inner focus-within:ring-2 focus-within:ring-cyan-400"
          role="search"
        >
          <select
            aria-label="Search department"
            value={selectedCategory}
            onChange={(e) => onSelectCategory(e.target.value)}
            className="hidden sm:block bg-slate-100 text-slate-800 text-xs font-semibold px-3 border-r border-slate-200 outline-none cursor-pointer"
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
            placeholder="Search products, brands and more..."
            aria-label="Search products and brands"
            className="flex-1 min-w-0 px-3.5 text-sm text-slate-900 outline-none"
          />
          <button type="submit" aria-label="Submit search" className="btn-primary px-4 font-bold text-sm">
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
          </button>
        </form>

        {/* Header Right Actions */}
        <div className="flex items-center gap-1.5 md:gap-2">
          <button
            type="button"
            onClick={onToggleServerDrawer}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold hover:bg-emerald-500/25 transition"
            title="Open admin API and database inspector"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400" aria-hidden="true"></span>
            <span>API Inspector</span>
          </button>

          <button
            type="button"
            onClick={onOpenAuth}
            className="px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-left transition"
          >
            <span className="block text-[10px] text-slate-300 leading-tight">
              {user ? `Hi, ${user.name}` : 'Welcome, Guest'}
            </span>
            <span className="block text-xs font-bold leading-tight">Account</span>
          </button>

          <button
            type="button"
            onClick={() => setIsWishlistOpen(true)}
            className="relative px-2.5 py-1.5 rounded-xl hover:bg-white/10 transition"
            title="View Wishlist"
            aria-label={`Open wishlist with ${wishlistIds.length} items`}
          >
            <i className="fa-regular fa-heart text-lg text-rose-400" aria-hidden="true"></i>
            <span className="absolute top-0.5 right-0.5 bg-rose-500 text-white text-[10px] font-extrabold px-1.5 rounded-full">
              {wishlistIds.length}
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenOrders}
            className="hidden md:block px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-left transition"
          >
            <span className="block text-[10px] text-slate-300 leading-tight">Track</span>
            <span className="block text-xs font-bold leading-tight">Orders</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 transition"
            aria-label={`Open shopping bag with ${itemCount} items`}
          >
            <i className="fa-solid fa-bag-shopping text-lg text-cyan-300" aria-hidden="true"></i>
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
