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
import { RecentlyViewed } from './components/RecentlyViewed';
import { ComparePanel } from './components/ComparePanel';
import { useCart } from './context/CartContext';

function readStoredProducts(key, limit) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]');
    if (!Array.isArray(value)) return [];
    return value
      .filter(item => item && Number.isSafeInteger(Number(item.id)) && Number(item.id) > 0)
      .slice(0, limit);
  } catch {
    return [];
  }
}

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

  // Recently viewed and product comparison are saved on this browser.
  const [recentProducts, setRecentProducts] = useState(() => readStoredProducts('nx_recently_viewed', 6));
  const [compareProducts, setCompareProducts] = useState(() => readStoredProducts('nx_compare', 3));
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('nx_recently_viewed', JSON.stringify(recentProducts));
    } catch (error) {
      console.warn('Recently viewed products could not be saved on this device.');
    }
  }, [recentProducts]);

  useEffect(() => {
    try {
      localStorage.setItem('nx_compare', JSON.stringify(compareProducts));
    } catch (error) {
      console.warn('Product comparison could not be saved on this device.');
    }
  }, [compareProducts]);

  // Location
  const [deliveryLocation, setDeliveryLocation] = useState('Set location');

  // Modals & Views
  const [activeProductDetail, setActiveProductDetail] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isServerDrawerOpen, setIsServerDrawerOpen] = useState(false);

  // Fetch products from the backend API.
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
    setCatalogTitle(cat === 'All' ? 'All Collections Catalog' : cat + ' Collection');
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
    setCatalogTitle(query ? 'Search results for "' + query + '"' : 'All Collections Catalog');
    scrollToCatalog();
  };

  const handleChangeLocation = () => {
    const loc = prompt('Enter delivery city and 6-digit Indian PIN code:', deliveryLocation);
    if (loc && loc.trim()) setDeliveryLocation(loc.trim());
  };

  const openProductDetails = (product) => {
    setActiveProductDetail(product);
    setRecentProducts(prev => [
      product,
      ...prev.filter(item => Number(item.id) !== Number(product.id))
    ].slice(0, 6));
  };

  const toggleCompareProduct = (product) => {
    const alreadySelected = compareProducts.some(item => Number(item.id) === Number(product.id));
    if (alreadySelected) {
      setCompareProducts(prev => prev.filter(item => Number(item.id) !== Number(product.id)));
      return;
    }
    if (compareProducts.length >= 3) {
      window.alert('You can compare up to 3 products at a time. Remove one product to add another.');
      return;
    }
    setCompareProducts(prev => [...prev, product]);
  };

  const handleBuyNow = (product, variant) => {
    addToCart(product, variant, 1);
    setIsCheckoutModalOpen(true);
  };

  const handleOrderPlaced = (order) => {
    alert('Demo order saved!\nReference: ' + order.orderId + '\nPayment method: ' + order.paymentMethod + '\nNo real payment or delivery has been arranged.');
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
        onOpenOrders={() => setIsOrdersModalOpen(true)}
        onOpenSeller={() => setIsSellerModalOpen(true)}
        onToggleServerDrawer={() => setIsServerDrawerOpen(prev => !prev)}
      />

      <CategoryBar
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        onSelectFlashDeals={handleSelectFlashDeals}
        onOpenSeller={() => setIsSellerModalOpen(true)}
      />

      {activeProductDetail ? (
        <ProductDetailModal
          product={activeProductDetail}
          onClose={() => setActiveProductDetail(null)}
          onBuyNow={handleBuyNow}
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
            onOpenProductDetail={openProductDetails}
          />

          <RecentlyViewed
            products={recentProducts}
            onOpenProduct={openProductDetails}
            onClear={() => setRecentProducts([])}
          />

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
            onOpenProductDetail={openProductDetails}
            compareProducts={compareProducts}
            onToggleCompare={toggleCompareProduct}
          />
        </div>
      )}

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

      <CartDrawer onProceedToCheckout={() => setIsCheckoutModalOpen(true)} />

      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        onOrderPlaced={handleOrderPlaced}
      />

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

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

      <ComparePanel
        items={compareProducts}
        isOpen={isCompareOpen}
        onOpen={() => setIsCompareOpen(true)}
        onClose={() => setIsCompareOpen(false)}
        onRemove={(id) => setCompareProducts(prev => prev.filter(item => Number(item.id) !== Number(id)))}
        onClear={() => {
          setCompareProducts([]);
          setIsCompareOpen(false);
        }}
      />
    </div>
  );
}
