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
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  const [sortSelect, setSortSelect] = useState('featured');
  const [flashOnly, setFlashOnly] = useState(false);
  const [catalogTitle, setCatalogTitle] = useState('All Collections Catalog');

  // Location
  const [deliveryLocation, setDeliveryLocation] = useState('Bengaluru 560001');

  // Modals & Views
  const [activeProductDetail, setActiveProductDetail] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isServerDrawerOpen, setIsServerDrawerOpen] = useState(false);

  // Fetch products from SQLite Backend API
  const fetchProducts = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

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
    if (loc && loc.trim()) {
      setDeliveryLocation(loc.trim());
    }
  };

  const handleBuyNow = (product, variant) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    addToCart(product, variant, 1);
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
        onOpenOrders={openOrders}
        onOpenSeller={openSeller}
        onToggleServerDrawer={toggleServerDrawer}
      />

      {/* Subcategory Bar */}
      <CategoryBar
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        onSelectFlashDeals={handleSelectFlashDeals}
        onOpenSeller={openSeller}
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
            8 Departments • Curated products • Account-based wishlist • Cash on Delivery
          </p>
        </div>
      </footer>

      {/* Slide-out & Modal Components */}
      <CartDrawer
        onProceedToCheckout={proceedToCheckout}
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
