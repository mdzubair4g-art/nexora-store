import React, { useState, useEffect, useRef } from 'react';
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

export function App() {
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchQuery, setActiveSearchQuery] = useState('');
  const productRequestId = useRef(0);
  const [priceFilter, setPriceFilter] = useState('all');
  const [sortSelect, setSortSelect] = useState('featured');
  const [flashOnly, setFlashOnly] = useState(false);
  const [catalogTitle, setCatalogTitle] = useState('All Collections Catalog');

  // Location
  const [deliveryLocation, setDeliveryLocation] = useState('Set location');

  // Modals & Views
  const [activeProductDetail, setActiveProductDetail] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isServerDrawerOpen, setIsServerDrawerOpen] = useState(false);

  // Fetch products from SQLite Backend API
  const fetchProducts = async () => {
    const requestId = ++productRequestId.current;
    try {
      setLoading(true);
      setLoadError('');
      const data = await api.getProducts({
        category: selectedCategory,
        collection: selectedCollection,
        flashOnly,
        search: activeSearchQuery,
        priceRange: priceFilter,
        sort: sortSelect
      });
      if (requestId === productRequestId.current) setProducts(data.products || []);
    } catch (err) {
      if (requestId === productRequestId.current) {
        console.error('Failed to load products from API:', err);
        setLoadError(err.message || 'We could not load the catalogue. Please try again.');
      }
    } finally {
      if (requestId === productRequestId.current) setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedCollection, flashOnly, activeSearchQuery, priceFilter, sortSelect]);

  const scrollToCatalog = () => {
    document.getElementById('catalogAnchor')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleClearFilters = () => {
    setSelectedCategory('All');
    setSelectedCollection(null);
    setFlashOnly(false);
    setSearchQuery('');
    setActiveSearchQuery('');
    setPriceFilter('all');
    setSortSelect('featured');
    setCatalogTitle('All Collections Catalog');
  };

  const handleSelectCategory = (cat) => {
    setActiveProductDetail(null);
    setSelectedCategory(cat);
    setSelectedCollection(null);
    setSearchQuery('');
    setActiveSearchQuery('');
    setFlashOnly(false);
    setCatalogTitle(cat === 'All' ? 'All Collections Catalog' : `${cat} Collection`);
    scrollToCatalog();
  };

  const handleSelectCollection = (colName) => {
    setActiveProductDetail(null);
    setSelectedCollection(colName);
    setSelectedCategory('All');
    setSearchQuery('');
    setActiveSearchQuery('');
    setFlashOnly(false);
    setCatalogTitle(colName);
    scrollToCatalog();
  };

  const handleSelectFlashDeals = () => {
    setActiveProductDetail(null);
    setFlashOnly(true);
    setSelectedCategory('All');
    setSelectedCollection(null);
    setSearchQuery('');
    setActiveSearchQuery('');
    setCatalogTitle('Featured Sample Picks');
    scrollToCatalog();
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setActiveProductDetail(null);
    const query = searchQuery.trim();
    setActiveSearchQuery(query);
    setCatalogTitle(query ? `Search results for "${query}"` : 'All Collections Catalog');
    scrollToCatalog();
  };

  const handleChangeLocation = () => {
    const loc = prompt('Enter delivery city and 6-digit Indian PIN code:', deliveryLocation);
    if (loc && loc.trim()) {
      setDeliveryLocation(loc.trim());
    }
  };

  const handleBuyNow = (product, variant) => {
    addToCart(product, variant, 1);
    setIsCheckoutModalOpen(true);
  };

  const handleOrderPlaced = (order) => {
    alert(`Demo order saved!\nReference: ${order.orderId}\nPayment method: ${order.paymentMethod}\nNo real payment or delivery has been arranged.`);
    setIsOrdersModalOpen(true);
  };

  const flashDealsList = products.filter(p => p.flashDeal);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation */}
      <Navbar
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        deliveryLocation={deliveryLocation}
        onChangeLocation={handleChangeLocation}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenOrders={() => setIsOrdersModalOpen(true)}
        onOpenSeller={() => setIsSellerModalOpen(true)}
        onToggleServerDrawer={() => setIsServerDrawerOpen(prev => !prev)}
      />

      {/* Subcategory Bar */}
      <CategoryBar
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        onSelectFlashDeals={handleSelectFlashDeals}
        onOpenSeller={() => setIsSellerModalOpen(true)}
      />

      {/* Main Content: Either Product Detail or Home Storefront */}
      {activeProductDetail ? (
        <ProductDetailModal
          product={activeProductDetail}
          onClose={() => setActiveProductDetail(null)}
          onBuyNow={handleBuyNow}
        />
      ) : (
        <div className="flex-1">
          {/* Hero Slider */}
          <HeroBanner
            onShopFlashDeals={handleSelectFlashDeals}
            onExploreCatalog={scrollToCatalog}
          />

          {/* Department Grid */}
          <DepartmentGrid
            onSelectCategory={handleSelectCategory}
            onResetCategory={() => handleSelectCategory('All')}
          />

          {/* Curated Lifestyle Edits */}
          <CuratedCollections
            onSelectCollection={handleSelectCollection}
          />

          {/* Flash Deals Row */}
          <FlashDeals
            deals={flashDealsList}
            onOpenProductDetail={(p) => setActiveProductDetail(p)}
          />

          {/* Main Product Catalog */}
          <ProductCatalog
            catalogTitle={catalogTitle}
            products={products}
            loading={loading}
            error={loadError}
            onRetry={fetchProducts}
            onClearFilters={handleClearFilters}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            priceFilter={priceFilter}
            onChangePriceFilter={setPriceFilter}
            sortSelect={sortSelect}
            onChangeSort={setSortSelect}
            onOpenProductDetail={(p) => setActiveProductDetail(p)}
          />
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs py-3 font-bold tracking-wide transition"
        >
          Back to Top ↑
        </button>
        <div className="nav-glass text-slate-300 text-xs py-8 px-4 text-center border-t border-indigo-900/40">
          <div className="text-lg font-black text-white tracking-wider mb-1">
            NEXORA<span className="text-cyan-400">.in</span>
          </div>
          <p className="text-slate-400">
            React + Express REST API • Sample catalogue • Simulated checkout • Portfolio demonstration
          </p>
        </div>
      </footer>

      {/* Slide-out & Modal Components */}
      <CartDrawer
        onProceedToCheckout={() => setIsCheckoutModalOpen(true)}
      />

      <CheckoutModal
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
