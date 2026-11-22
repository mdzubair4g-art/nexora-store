const API_BASE = '/api';

function getAuthHeader() {
  const token = localStorage.getItem('nx_token');
  return token ? { Authorization: 'Bearer ' + token } : {};
}

export const api = {
  // Products
  async getProducts(params = {}) {
    const qs = new URLSearchParams();
    if (params.category && params.category !== 'All') qs.append('category', params.category);
    if (params.collection) qs.append('collection', params.collection);
    if (params.flashOnly) qs.append('flashOnly', 'true');
    if (params.search) qs.append('search', params.search);
    if (params.priceRange && params.priceRange !== 'all') qs.append('priceRange', params.priceRange);
    if (params.sort && params.sort !== 'featured') qs.append('sort', params.sort);

    const res = await fetch(API_BASE + '/products?' + qs.toString());
    if (!res.ok) {
      const error = new Error('Failed to load products. Please try again.');
      error.status = res.status;
      throw error;
    }
    return res.json();
  },

  async getProductById(id) {
    const res = await fetch(API_BASE + '/products/' + id);
    if (!res.ok) throw new Error('Product not found');
    return res.json();
  },

  async createProduct(payload) {
    const res = await fetch(API_BASE + '/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create product');
    }
    return res.json();
  },

  async updateProduct(id, payload) {
    const res = await fetch(API_BASE + '/products/' + id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const error = new Error(err.error || 'Failed to update product');
      error.status = res.status;
      throw error;
    }
    return res.json();
  },

  async addReview(productId, review) {
    const res = await fetch(API_BASE + '/products/' + productId + '/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(review)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to post review');
    }
    return res.json();
  },

  // Auth
  async getCurrentUser() {
    const res = await fetch(API_BASE + '/auth/me', { headers: getAuthHeader() });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const error = new Error(data.error || 'Could not verify the signed-in account.');
      error.status = res.status;
      throw error;
    }
    return data;
  },

  async login(email, password) {
    const res = await fetch(API_BASE + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
  },

  async register(name, email, password) {
    const res = await fetch(API_BASE + '/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    return data;
  },

  // Wishlist
  async getWishlist() {
    const res = await fetch(API_BASE + '/wishlist', { headers: getAuthHeader() });
    if (!res.ok) throw new Error('Failed to load wishlist');
    return res.json();
  },

  async toggleWishlist(productId) {
    const res = await fetch(API_BASE + '/wishlist/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ productId })
    });
    if (!res.ok) throw new Error('Failed to update wishlist');
    return res.json();
  },

  // Coupons
  async applyCoupon(code, subtotal) {
    const res = await fetch(API_BASE + '/coupons/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, subtotal })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Invalid coupon');
    return data;
  },

  // Postal-area lookup
  async lookupPincode(pincode) {
    const res = await fetch(API_BASE + '/shipping/pincode/' + pincode);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Postal lookup failed');
    return data;
  },

  // Demo payment methods
  async getPaymentMethods() {
    const res = await fetch(API_BASE + '/payments/methods');
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Could not load demo payment methods.');
    return data;
  },

  async createPaymentOrder(amount, receipt) {
    const res = await fetch(API_BASE + '/payments/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, receipt })
    });
    if (!res.ok) throw new Error('Failed to create payment order');
    return res.json();
  },

  async verifyPayment(payload) {
    const res = await fetch(API_BASE + '/payments/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Demo payment verification failed.');
    return data;
  },

  // Orders
  async placeOrder(orderData) {
    const res = await fetch(API_BASE + '/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(orderData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Order placement failed');
    return data;
  },

  async getOrders() {
    const res = await fetch(API_BASE + '/orders', { headers: getAuthHeader() });
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  // Admin API inspector
  async getStats() {
    const res = await fetch(API_BASE + '/stats', { headers: getAuthHeader() });
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  }
};
