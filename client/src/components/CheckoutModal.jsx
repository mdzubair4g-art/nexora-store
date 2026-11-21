import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export function CheckoutModal({ isOpen, onClose, onOrderPlaced }) {
  const { cart, finalTotal, subtotal, couponDiscount, coupon, clearCart } = useCart();
  const { user } = useAuth();

  const [pincode, setPincode] = useState('');
  const [shippingInfo, setShippingInfo] = useState(null);
  const [loadingPincode, setLoadingPincode] = useState(false);
  const [pincodeError, setPincodeError] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [recipientName, setRecipientName] = useState(user?.name || '');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePincodeLookup = async (code) => {
    if (!/^\d{6}$/.test(code)) return;
    setLoadingPincode(true);
    setPincodeError('');
    try {
      const data = await api.lookupPincode(code);
      setShippingInfo(data);
    } catch (err) {
      setShippingInfo(null);
      setPincodeError(err.message || 'We could not verify this PIN code.');
    } finally {
      setLoadingPincode(false);
    }
  };

  useEffect(() => {
    if (isOpen && user?.name) {
      setRecipientName(user.name);
    }
  }, [isOpen, user?.name]);

  useEffect(() => {
    if (isOpen && /^\d{6}$/.test(pincode)) {
      handlePincodeLookup(pincode);
    }
  }, [isOpen, pincode]);

  const handlePincodeChange = (value) => {
    const cleanValue = value.replace(/\D/g, '').slice(0, 6);
    setPincode(cleanValue);
    setShippingInfo(null);
    setPincodeError('');
  };

  const handleConfirmOrder = async (event) => {
    event.preventDefault();

    if (!user) {
      alert('Please sign in before placing an order.');
      return;
    }
    if (cart.length === 0) {
      alert('Your shopping bag is empty.');
      return;
    }
    if (!shippingInfo) {
      alert('Please enter a valid, serviceable PIN code.');
      return;
    }

    setIsProcessing(true);
    try {
      const city = shippingInfo.city || shippingInfo.district || '';
      const state = shippingInfo.state || '';
      const fullAddress = recipientName.trim() + ' (' + recipientPhone.trim() + '), ' +
        addressLine.trim() + ', ' + city + ', ' + state + ' - ' + pincode;

      const order = await api.placeOrder({
        items: cart,
        couponCode: coupon || '',
        subtotal,
        discount: couponDiscount,
        totalAmount: finalTotal,
        paymentMethod: 'Cash on Delivery (COD)',
        shippingAddress: fullAddress,
        city,
        state,
        pincode
      });

      clearCart();
      onClose();
      onOrderPlaced(order);
    } catch (err) {
      alert('Order could not be placed: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close checkout"
          className="absolute top-3 right-4 text-2xl leading-none text-slate-400 hover:text-slate-700 transition"
        >
          &times;
        </button>

        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4 pr-8">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center text-lg">
            <i className="fa-solid fa-box"></i>
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 leading-tight">Delivery checkout</h3>
            <p className="text-xs text-slate-500">Signed in as {user?.email || 'your account'}</p>
          </div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 mb-4 text-xs text-amber-900">
          <strong>Cash on Delivery only.</strong> Online payments are disabled until a real payment gateway is connected and verified.
        </div>

        <form onSubmit={handleConfirmOrder} className="space-y-4 text-sm">
          <section className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-extrabold text-slate-800 uppercase tracking-wide text-[11px] flex items-center gap-2">
              <i className="fa-solid fa-location-dot text-cyan-600"></i>
              Delivery details
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label className="text-[11px] text-slate-600 font-semibold">
                Recipient name
                <input
                  type="text"
                  required
                  maxLength={80}
                  value={recipientName}
                  onChange={(event) => setRecipientName(event.target.value)}
                  className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 bg-white text-sm text-slate-900"
                />
              </label>
              <label className="text-[11px] text-slate-600 font-semibold">
                Mobile number
                <input
                  type="tel"
                  required
                  inputMode="numeric"
                  pattern="[6-9][0-9]{9}"
                  title="Enter a valid 10-digit Indian mobile number"
                  value={recipientPhone}
                  onChange={(event) => setRecipientPhone(event.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 bg-white text-sm text-slate-900"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <label className="text-[11px] text-slate-600 font-semibold">
                PIN code
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  value={pincode}
                  onChange={(event) => handlePincodeChange(event.target.value)}
                  placeholder="6-digit PIN"
                  className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 bg-white font-mono text-sm text-slate-900"
                />
              </label>
              <label className="sm:col-span-2 text-[11px] text-slate-600 font-semibold">
                Detected city / state
                <input
                  type="text"
                  readOnly
                  value={loadingPincode ? 'Checking PIN code...' : shippingInfo ? cityLabel(shippingInfo) : 'Enter your PIN code'}
                  className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 bg-slate-100 text-sm text-slate-700"
                />
              </label>
            </div>

            {pincodeError && (
              <p className="text-xs text-rose-700" role="alert">{pincodeError}</p>
            )}
            {shippingInfo && (
              <p className="text-xs text-emerald-700">
                <i className="fa-solid fa-circle-check mr-1"></i>
                PIN code lookup completed. Delivery estimate: {shippingInfo.deliveryDate || 'To be confirmed'}.
              </p>
            )}

            <label className="block text-[11px] text-slate-600 font-semibold">
              House / street / landmark
              <textarea
                required
                maxLength={350}
                rows={2}
                value={addressLine}
                onChange={(event) => setAddressLine(event.target.value)}
                placeholder="Flat, building, street and nearby landmark"
                className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 bg-white text-sm text-slate-900 resize-y"
              />
            </label>
          </section>

          <section className="rounded-xl border border-cyan-200 bg-cyan-50/70 p-3.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-truck text-cyan-700 text-lg"></i>
                <div>
                  <p className="font-bold text-slate-900 text-sm">Cash on Delivery</p>
                  <p className="text-[11px] text-slate-600">Pay when your order arrives.</p>
                </div>
              </div>
              <span className="text-[10px] uppercase font-black tracking-wide bg-white text-cyan-800 rounded-full px-2.5 py-1">Available</span>
            </div>
          </section>

          <div className="bg-slate-100 p-3.5 rounded-xl flex items-center justify-between gap-3">
            <div>
              <span className="text-slate-600 text-xs block">{cart.length} cart item(s)</span>
              <span className="text-slate-900 font-bold">Order total</span>
            </div>
            <span className="text-cyan-700 text-xl font-black">₹{finalTotal.toLocaleString('en-IN')}</span>
          </div>

          <button
            type="submit"
            disabled={isProcessing || loadingPincode || !user}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold text-sm shadow flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <i className="fa-solid fa-spinner animate-spin"></i>
                Placing your order...
              </>
            ) : (
              'Place Cash on Delivery order'
            )}
          </button>
          <p className="text-[10px] text-center text-slate-500">
            Your order amount is recalculated from the product catalogue on the server.
          </p>
        </form>
      </div>
    </div>
  );
}

function cityLabel(info) {
  const city = info.city || info.district || '';
  const state = info.state || '';
  return [city, state].filter(Boolean).join(', ');
}
