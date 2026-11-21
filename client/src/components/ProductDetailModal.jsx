import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export function ProductDetailModal({ product: initialProduct, onClose, onBuyNow, onOpenAuth }) {
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(initialProduct);
  const [selectedVariant, setSelectedVariant] = useState(
    initialProduct?.variants?.[0] || 'Standard'
  );
  const [revRating, setRevRating] = useState('5');
  const [revComment, setRevComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch full details with reviews from backend
  useEffect(() => {
    if (initialProduct?.id) {
      api.getProductById(initialProduct.id)
        .then(data => {
          setProduct(data);
          if (data.variants && data.variants.length > 0) {
            setSelectedVariant(data.variants[0]);
          }
        })
        .catch(err => console.error('Failed to fetch product details:', err));
    }
  }, [initialProduct?.id]);

  if (!product) return null;

  const off = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!revComment.trim()) return;

    setIsSubmitting(true);
    try {
      await api.addReview(product.id, {
        user: user?.name || 'Verified Shopper',
        rating: Number(revRating),
        comment: revComment.trim()
      });
      // Refresh product details to show new review
      const updated = await api.getProductById(product.id);
      setProduct(updated);
      setRevComment('');
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto w-full px-3 md:px-6 py-6">
      <button
        onClick={onClose}
        className="text-xs text-cyan-700 font-bold hover:underline mb-4 inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl shadow-sm border border-slate-200 transition"
      >
        <i className="fa-solid fa-arrow-left"></i> Back to Collections
      </button>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Product Image */}
          <div className="md:col-span-5 bg-slate-50 rounded-2xl p-6 flex items-center justify-center border border-slate-100">
            <img
              src={product.image}
              alt={product.title}
              className="max-h-80 object-contain"
            />
          </div>

          {/* Details & Specs */}
          <div className="md:col-span-4 space-y-3">
            <span className="inline-block bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full">
              {product.category} • {product.brand}
            </span>

            <h1 className="text-xl font-black leading-snug text-slate-900">
              {product.title}
            </h1>

            <div className="flex items-center gap-2 text-xs border-b border-slate-100 pb-3">
              <span className="bg-emerald-600 text-white font-bold px-2 py-0.5 rounded flex items-center gap-1">
                <span>★</span> {product.rating}
              </span>
              <span className="text-slate-500">
                {product.reviewsCount?.toLocaleString('en-IN')} verified ratings
              </span>
            </div>

            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                <span className="text-sm text-slate-400 line-through">
                  ₹{product.mrp.toLocaleString('en-IN')}
                </span>
                {off > 0 && (
                  <span className="text-sm font-extrabold text-emerald-600">
                    {off}% OFF
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Eligible for coupon <strong className="text-orange-600">NEXORA10</strong>
              </div>
            </div>

            {/* Variant Selector */}
            {product.variants && product.variants.length > 0 && (
              <div>
                <div className="text-xs font-bold mb-1.5">Select Variant:</div>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-3 py-1.5 text-xs border rounded-xl transition ${
                        selectedVariant === v
                          ? 'border-cyan-600 bg-cyan-50 text-cyan-900 font-bold'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Highlights List */}
            {product.highlights && product.highlights.length > 0 && (
              <div className="pt-2">
                <div className="text-xs font-bold mb-1.5">Key Highlights:</div>
                <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1">
                  {product.highlights.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Buy Box Panel */}
          <div className="md:col-span-3 border border-slate-200 rounded-2xl p-5 h-fit space-y-3 bg-slate-50/60">
            <div className="text-2xl font-black">
              ₹{product.price.toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-cyan-700 font-semibold flex items-center gap-1.5">
              <i className="fa-solid fa-truck-fast"></i>
              {product.stock > 0 ? 'Delivery options shown at checkout' : 'Currently out of stock'}
            </div>
            <div className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              {product.stock > 0 ? 'In Stock (' + product.stock + ' available)' : 'Out of Stock'}
            </div>

            <button
              onClick={() => addToCart(product, selectedVariant)}
              disabled={Number(product.stock) <= 0}
              className="w-full btn-primary py-2.5 rounded-xl text-xs font-bold shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {Number(product.stock) > 0 ? 'Add to Bag' : 'Out of Stock'}
            </button>
            <button
              onClick={() => onBuyNow(product, selectedVariant)}
              disabled={Number(product.stock) <= 0}
              className="w-full btn-cyan py-2.5 rounded-xl text-xs font-bold shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {Number(product.stock) > 0 ? 'Buy Now' : 'Unavailable'}
            </button>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Write Review */}
          <div className="md:col-span-4">
            <h3 className="font-black text-base mb-2">Write a Customer Review</h3>
            <form onSubmit={handleReviewSubmit} className="space-y-2.5 text-xs">
              <select
                value={revRating}
                onChange={(e) => setRevRating(e.target.value)}
                className="w-full border rounded-xl px-3 py-2 bg-slate-50 outline-none"
              >
                <option value="5">★★★★★ (5 Stars - Exceptional)</option>
                <option value="4">★★★★☆ (4 Stars - Very Good)</option>
                <option value="3">★★★☆☆ (3 Stars - Average)</option>
                <option value="2">★★☆☆☆ (2 Stars - Disappointing)</option>
                <option value="1">★☆☆☆☆ (1 Star - Poor)</option>
              </select>

              <textarea
                value={revComment}
                onChange={(e) => setRevComment(e.target.value)}
                required
                rows={3}
                placeholder="Share your verified experience..."
                className="w-full border rounded-xl p-3 outline-none focus:ring-1 focus:ring-cyan-500"
              />

              <button
                type={user ? 'submit' : 'button'}
                onClick={!user ? onOpenAuth : undefined}
                disabled={isSubmitting && Boolean(user)}
                className="btn-primary px-5 py-2 rounded-xl font-bold disabled:opacity-50"
              >
                {!user ? 'Sign in to review' : (isSubmitting ? 'Posting...' : 'Post Review')}
              </button>
            </form>
          </div>

          {/* Review List */}
          <div className="md:col-span-8">
            <h3 className="font-black text-base mb-3">
              Customer Reviews ({product.reviews?.length || 0})
            </h3>
            <div className="space-y-3">
              {!product.reviews || product.reviews.length === 0 ? (
                <p className="text-xs text-slate-500">No written reviews yet. Be the first to review!</p>
              ) : (
                product.reviews.map(r => (
                  <div key={r.id} className="border border-slate-100 rounded-xl p-3.5 bg-slate-50/50 text-xs">
                    <div className="flex justify-between font-bold">
                      <span>{r.user}</span>
                      <span className="text-slate-400 font-normal">{r.date}</span>
                    </div>
                    <div className="text-amber-500 font-bold my-1">
                      {'★'.repeat(r.rating)}
                      <span className="text-slate-500 ml-1.5 font-normal text-[11px]">
                        Customer review
                      </span>
                    </div>
                    <p className="text-slate-700">{r.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
