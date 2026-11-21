import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { CategoryBar } from './components/CategoryBar';
import { HeroBanner } from './components/HeroBanner';
import { DepartmentGrid } from './components/DepartmentGrid';
import { CuratedCollections } from './components/CuratedCollections';
import { FlashDeals } from './components/FlashDeals';
import { ProductCatalog } from './components/ProductCatalog';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { AuthModal } from './components/AuthModal';
import { WishlistModal } from './components/WishlistModal';
import { OrdersModal } from './components/OrdersModal';
import { SellerModal } from './components/SellerModal';
import { ApiDrawer } from './components/ApiDrawer';
import { useCart } from './context/CartContext';
import { useAuth } from './context/AuthContext';

export function App() {
  const { addToCart, setIsCartOpen } = useCart();
  const { user } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [commerceReady, setCommerceReady] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  const [sortSelect, setSortSelect] = useState('featured');
  const [flashOnly, setFlashOnly] = useState(false);
  const [catalogTitle, setCatalogTitle] = useState('All Collections Catalog');

  const [deliveryLocation, setDeliveryLocation] = useState('Bengaluru 560001');

  const [activeProductDetail, setActiveProductDetail] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isServerDrawerOpen, setIsServerDrawerOpen] = useState(false);

  // Fetch products from the backend API (SQLite locally, PostgreSQL in deployments).
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setLoadError('');
      const data = await api.getProducts({
        category: selectedCategory,
        collection: selectedCollection,
        flashOnly,
        search: searchQuery,
        priceRange: priceFilter,
        sort: sortSelect
      });
      setProducts(data.products || []);
    } catch (err) {
      console.error('Failed to load products from API:', err);
      setLoadError(err.message || 'The catalogue could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    api.getHealth()
      .then(health => { if (active) setCommerceReady(health.commerceReady === true); })
      .catch(() => { if (active) setCommerceReady(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedCollection, flashOnly, priceFilter, sortSelect]);

  const scrollToCatalog = () => {
    document.getElementById('catalogAnchor')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectCategory = (cat) => {
    setActiveProductDetail(null);
    setSelectedCategory(cat);
    setSelectedCollection(null);
    setFlashOnly(false);
    setCatalogTitle(cat === 'All' ? 'All Collections Catalog' : `${cat} Collection`);
    scrollToCatalog();
  };

  const handleSelectCollection = (colName) => {
    setActiveProductDetail(null);
    setSelectedCollection(colName);
    setSelectedCategory('All');
    setFlashOnly(false);
    setCatalogTitle(colName);
    scrollToCatalog();
  };

  const handleSelectFlashDeals = () => {
    setActiveProductDetail(null);
    setFlashOnly(true);
    setSelectedCategory('All');
    setSelectedCollection(null);
    setCatalogTitle('Flash Deals — Limited Time Lightning Offers');
    scrollToCatalog();
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setActiveProductDetail(null);
    setCatalogTitle(searchQuery.trim() ? `Search results for "${searchQuery}"` : 'All Collections Catalog');
    fetchProducts();
    scrollToCatalog();
  };

  const handleChangeLocation = () => {
    const loc = prompt('Enter delivery city and 6-digit Indian PIN code:', deliveryLocation);
    if (loc && loc.trim()) setDeliveryLocation(loc.trim());
  };

  const handleBuyNow = (product, variant) => {
    if (!commerceReady) {
      alert('Ordering is paused while the store owner verifies the real product catalogue, prices and inventory.');
      return;
    }
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    addToCart(product, variant, 1);
    setIsCartOpen(false);
    setIsCheckoutModalOpen(true);
  };

  const openOrders = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    setIsOrdersModalOpen(true);
  };

  const openSeller = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    if (user.role !== 'admin') {
      alert('Seller Studio is available to administrators only.');
      return;
    }
    setIsSellerModalOpen(true);
  };

  const proceedToCheckout = () => {
    if (!commerceReady) {
      alert('Ordering is paused while the store owner verifies the real product catalogue, prices and inventory.');
      return;
    }
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    setIsCheckoutModalOpen(true);
  };

  const toggleServerDrawer = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    if (user.role !== 'admin') {
      alert('The API inspector is available to administrators only.');
      return;
    }
    setIsServerDrawerOpen(prev => !prev);
  };

  const handleOrderPlaced = (order) => {
    alert(`Order Placed Successfully!\nOrder Reference: ${order.orderId}\nPayment Method: ${order.paymentMethod}`);
    setIsOrdersModalOpen(true);
  };

  const flashDealsList = products.filter(p => p.flashDeal);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        deliveryLocation={deliveryLocation}
        onChangeLocation={handleChangeLocation}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenOrders={openOrders}
        onOpenSeller={openSeller}
        onToggleServerDrawer={toggleServerDrawer}
      />

      <CategoryBar
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        onSelectFlashDeals={handleSelectFlashDeals}
        onOpenSeller={openSeller}
      />

      {!commerceReady && (
        <div role="status" className="mx-auto my-3 w-[min(1440px,calc(100%-24px))] rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-950 shadow-sm">
          <strong className="block text-sm mb-1">NEXORA demo catalogue — ordering paused</strong>
          Product names, images, prices, stock and coupon offers are sample data and have not been verified by the store owner. Browse the catalogue, but do not place or rely on a real order yet.
        </div>
      )}

      {activeProductDetail ? (
        <ProductDetailModal
          product={activeProductDetail}
          onClose={() => setActiveProductDetail(null)}
          onBuyNow={handleBuyNow}
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />
      ) : (
        <div className="flex-1">
          <HeroBanner
            onShopFlashDeals={handleSelectFlashDeals}
            onExploreCatalog={scrollToCatalog}
          />
          <DepartmentGrid
            onSelectCategory={handleSelectCategory}
            onResetCategory={() => handleSelectCategory('All')}
          />
          <CuratedCollections onSelectCollection={handleSelectCollection} />
          <FlashDeals
            deals={flashDealsList}
            onOpenProductDetail={(product) => setActiveProductDetail(product)}
          />
          <ProductCatalog
            catalogTitle={catalogTitle}
            products={products}
            loading={loading}
            error={loadError}
            onRetry={fetchProducts}
            priceFilter={priceFilter}
            onChangePriceFilter={setPriceFilter}
            sortSelect={sortSelect}
            onChangeSort={setSortSelect}
            onOpenProductDetail={(product) => setActiveProductDetail(product)}
          />
        </div>
      )}

      <footer className="mt-auto">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs py-3 font-bold tracking-wide transition"
        >
          Back to Top ↑
        </button>
        <div className="nav-glass text-slate-300 text-xs py-8 px-4 text-center border-t border-indigo-900/40">
          <img
            src="/nexora-mark.svg"
            alt=""
            aria-hidden="true"
            width="36"
            height="36"
            className="w-9 h-9 mx-auto mb-2"
          />
          <div className="text-lg font-black text-white tracking-wider mb-1">
            NEXORA<span className="text-cyan-400">.in</span>
          </div>
          <p className="text-slate-400">
            Curated marketplace • 8 departments • Account-based wishlist • Cash on Delivery
          </p>
        </div>
      </footer>

      <CartDrawer onProceedToCheckout={proceedToCheckout} commerceReady={commerceReady} />

      <CheckoutModal
        commerceReady={commerceReady}
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        onOrderPlaced={handleOrderPlaced}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <WishlistModal />

      <OrdersModal
        isOpen={isOrdersModalOpen}
        onClose={() => setIsOrdersModalOpen(false)}
      />

      <SellerModal
        isOpen={isSellerModalOpen}
        onClose={() => setIsSellerModalOpen(false)}
        onProductPublished={() => {
          fetchProducts();
          handleSelectCategory('All');
        }}
      />

      <ApiDrawer
        isOpen={isServerDrawerOpen}
        onClose={() => setIsServerDrawerOpen(false)}
      />
    </div>
  );
}
