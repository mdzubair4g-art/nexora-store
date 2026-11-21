const API_BASE = '/api';

function getAuthHeader() {
  const token = localStorage.getItem('nx_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
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

    const res = await fetch(`${API_BASE}/products?${qs.toString()}`);
    if (!res.ok) throw new Error('Failed to load products');
    return res.json();
  },

  async getProductById(id) {
    const res = await fetch(`${API_BASE}/products/${id}`);
    if (!res.ok) throw new Error('Product not found');
    return res.json();
  },

  async createProduct(payload) {
    const res = await fetch(`${API_BASE}/products`, {
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

  async addReview(productId, review) {
    const res = await fetch(`${API_BASE}/products/${productId}/reviews`, {
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
    const res = await fetch(`${API_BASE}/auth/me`, { headers: getAuthHeader() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Session is invalid');
    return data;
  },

  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
  },

  async register(name, email, password) {
    const res = await fetch(`${API_BASE}/auth/register`, {
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
    const res = await fetch(`${API_BASE}/wishlist`, { headers: getAuthHeader() });
    if (!res.ok) throw new Error('Failed to load wishlist');
    return res.json();
  },

  async toggleWishlist(productId) {
    const res = await fetch(`${API_BASE}/wishlist/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ productId })
    });
    if (!res.ok) throw new Error('Failed to update wishlist');
    return res.json();
  },

  // Coupons
  async applyCoupon(code, subtotal) {
    const res = await fetch(`${API_BASE}/coupons/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, subtotal })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Invalid coupon');
    return data;
  },

  // Shipping & Pincode Lookup (Option 4)
  async lookupPincode(pincode) {
    const res = await fetch(`${API_BASE}/shipping/pincode/${pincode}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Pincode not serviceable');
    return data;
  },

  // Payment Gateway (Option 4)
  async getPaymentMethods() {
    const res = await fetch(`${API_BASE}/payments/methods`);
    return res.json();
  },

  async createPaymentOrder(amount, receipt) {
    const res = await fetch(`${API_BASE}/payments/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, receipt })
    });
    if (!res.ok) throw new Error('Failed to create payment order');
    return res.json();
  },

  async verifyPayment(payload) {
    const res = await fetch(`${API_BASE}/payments/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // Orders
  async placeOrder(orderData) {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(orderData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Order placement failed');
    return data;
  },

  async getOrders() {
    const res = await fetch(`${API_BASE}/orders`, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  // Server Inspector Stats
  async getStats() {
    const res = await fetch(`${API_BASE}/stats`, { headers: getAuthHeader() });
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  }
};
