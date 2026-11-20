import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

export function CartDrawer({ onProceedToCheckout }) {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQty,
    subtotal,
    finalTotal,
    coupon,
    couponDiscount,
    couponMessage,
    applyCouponCode
  } = useCart();

  const [inputCode, setInputCode] = useState('');
  const [loadingCoupon, setLoadingCoupon] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async () => {
    if (!inputCode.trim()) return;
    setLoadingCoupon(true);
    try {
      await applyCouponCode(inputCode.trim());
    } catch {
      // Error message is set in context
    } finally {
      setLoadingCoupon(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 z-50 flex justify-end transition-opacity">
      <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-4 nav-glass text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-bag-shopping text-cyan-400"></i>
            <h3 className="font-bold text-base">Your Shopping Bag</h3>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="text-2xl leading-none hover:text-cyan-300 transition"
          >
            &times;
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center text-slate-500 text-sm py-16">
              <i className="fa-solid fa-bag-shopping text-4xl text-slate-300 block mb-3"></i>
              Your NEXORA shopping bag is empty.
            </div>
          ) : (
            cart.map((item, index) => (
              <div
                key={`${item.id}-${item.variant}`}
                className="flex gap-3 border border-slate-100 rounded-xl p-3 bg-slate-50/50"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-16 h-16 object-contain bg-white rounded-lg p-1 border border-slate-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold line-clamp-2 text-slate-900">
                    {item.title}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Variant: <span className="font-semibold text-slate-700">{item.variant}</span>
                  </div>
                  <div className="text-sm font-black mt-1 text-slate-900">
                    ₹{item.price.toLocaleString('en-IN')}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <button
                      onClick={() => updateQty(index, -1)}
                      className="w-6 h-6 bg-slate-200 hover:bg-slate-300 rounded-lg text-xs font-bold flex items-center justify-center transition"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold px-1">{item.qty}</span>
                    <button
                      onClick={() => updateQty(index, 1)}
                      className="w-6 h-6 bg-slate-200 hover:bg-slate-300 rounded-lg text-xs font-bold flex items-center justify-center transition"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Checkout & Promo Panel */}
        {cart.length > 0 && (
          <div className="p-4 border-t bg-slate-50 space-y-3">
            {/* Promo Code Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="Promo code (try NEXORA10)"
                className="flex-1 border border-slate-200 rounded-xl px-3 py-1.5 text-xs uppercase bg-white outline-none focus:ring-1 focus:ring-cyan-500"
              />
              <button
                onClick={handleApplyCoupon}
                disabled={loadingCoupon}
                className="btn-cyan px-3.5 py-1.5 rounded-xl text-xs font-bold disabled:opacity-50"
              >
                {loadingCoupon ? 'Checking...' : 'Apply'}
              </button>
            </div>

            {couponMessage && (
              <div className={`text-[11px] font-bold ${coupon ? 'text-emerald-700' : 'text-rose-600'}`}>
                {couponMessage}
              </div>
            )}

            {/* Calculations */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Coupon Discount ({coupon}):</span>
                  <span>-₹{couponDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between font-black text-base text-slate-900 pt-1 border-t">
                <span>Total Payable:</span>
                <span className="text-orange-600">₹{finalTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setIsCartOpen(false);
                onProceedToCheckout();
              }}
              className="w-full btn-primary py-2.5 rounded-xl font-bold text-sm shadow"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
