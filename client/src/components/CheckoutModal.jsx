import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export function CheckoutModal({ isOpen, onClose, onOrderPlaced }) {
  const { cart, finalTotal, subtotal, couponDiscount, coupon, clearCart } = useCart();
  const { user } = useAuth();

  const [pincode, setPincode] = useState('');
  const [shippingInfo, setShippingInfo] = useState(null);
  const [pincodeError, setPincodeError] = useState('');
  const [loadingPincode, setLoadingPincode] = useState(false);
  const [addressLine, setAddressLine] = useState('');
  const [recipientName, setRecipientName] = useState(user?.name || '');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const pincodeLookupId = useRef(0);

  useEffect(() => {
    if (isOpen && user?.name) setRecipientName(user.name);
    if (!isOpen) pincodeLookupId.current += 1;
  }, [isOpen, user?.name]);

  if (!isOpen) return null;

  const handlePincodeLookup = async (code) => {
    if (!/^\d{6}$/.test(code)) return;
    const requestId = ++pincodeLookupId.current;
    setLoadingPincode(true);
    setPincodeError('');
    try {
      const data = await api.lookupPincode(code);
      if (requestId === pincodeLookupId.current) setShippingInfo(data);
    } catch (err) {
      if (requestId === pincodeLookupId.current) {
        setShippingInfo(null);
        setPincodeError(err.message || 'Could not verify this PIN code. Please try again.');
      }
    } finally {
      if (requestId === pincodeLookupId.current) setLoadingPincode(false);
    }
  };

  const handlePincodeChange = (val) => {
    pincodeLookupId.current += 1;
    setLoadingPincode(false);
    setPincodeError('');
    setShippingInfo(null);
    setPincode(val);
    if (val.length === 6) {
      handlePincodeLookup(val);
    } else {
      setShippingInfo(null);
    }
  };

  const handleConfirmOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return alert('Your shopping bag is empty.');
    if (!user) return alert('Please sign in before placing an order so you can securely access your order history.');

    setIsProcessing(true);
    try {
      if (!recipientName.trim() || recipientName.trim().length > 80) throw new Error('Enter a recipient name (up to 80 characters).');
      if (!/^[6-9]\d{9}$/.test(recipientPhone.trim())) throw new Error('Enter a valid 10-digit Indian mobile number.');
      if (addressLine.trim().length < 5 || addressLine.trim().length > 350) throw new Error('Enter a delivery address between 5 and 350 characters.');
      if (!shippingInfo || shippingInfo.pincode !== pincode || !shippingInfo.city || !shippingInfo.state) throw new Error('Please verify your delivery PIN code before placing the order.');

      let paymentId = null;
      if (paymentMethod !== 'cod') {
        const paymentOrder = await api.createPaymentOrder(finalTotal, `demo_rcpt_${Date.now()}`);
        const paymentVerification = await api.verifyPayment({ razorpay_order_id: paymentOrder.id, method: paymentMethod });
        if (!paymentVerification.verified || paymentVerification.mode !== 'demo') throw new Error('Demo payment could not be verified.');
        paymentId = paymentVerification.paymentId;
      }

      const fullAddress = `${recipientName.trim()} · ${recipientPhone.trim()} · ${addressLine.trim()}, ${shippingInfo.city}, ${shippingInfo.state} - ${pincode}`;
      const order = await api.placeOrder({
        userEmail: user?.email || 'guest@nexora.in',
        items: cart,
        subtotal,
        discount: couponDiscount,
        couponCode: coupon,
        totalAmount: finalTotal,
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'PENDING_ON_DELIVERY' : 'DEMO_SIMULATED',
        paymentId,
        shippingAddress: fullAddress,
        city: shippingInfo?.city || 'Bengaluru',
        state: shippingInfo?.state || 'Karnataka',
        pincode
      });

      clearCart();
      onClose();
      onOrderPlaced(order);
    } catch (err) {
      alert(`Payment / Order Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          aria-label="Close checkout"
          className="absolute top-4 right-4 text-xl text-slate-400 hover:text-slate-600 transition"
        >
          &times;
        </button>

        <div className="flex items-center gap-2 border-b pb-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
            <i className="fa-solid fa-shield-halved"></i>
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 leading-tight">Checkout Demo</h3>
            <p className="text-[11px] text-amber-700">Portfolio demo checkout · No real payment is processed</p>
          </div>
        </div>

        <form onSubmit={handleConfirmOrder} className="space-y-4 text-xs">
          {/* Section 1: Delivery Address & Postal-Area Lookup */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="font-extrabold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <i className="fa-solid fa-location-dot text-cyan-600"></i>
                1. Address & Postal-Area Lookup
              </label>
              {loadingPincode && (
                <span className="text-[10px] text-cyan-600 font-bold animate-pulse">
                  Verifying pincode...
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Recipient Name</label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full border rounded-xl px-2.5 py-1.5 bg-white text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Mobile Number</label>
                <input
                  type="tel"
                  required
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  className="w-full border rounded-xl px-2.5 py-1.5 bg-white text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-1">
                <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">PIN Code</label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={pincode}
                  inputMode="numeric"
                  onChange={(e) => handlePincodeChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="6-digit PIN"
                  className="w-full border rounded-xl px-2.5 py-1.5 bg-white font-mono font-bold text-xs"
                />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Detected City / State</label>
                <input
                  type="text"
                  readOnly
                  value={shippingInfo ? `${shippingInfo.city}, ${shippingInfo.state}` : 'Enter valid 6-digit PIN'}
                  className="w-full border rounded-xl px-2.5 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">House / Street / Landmark</label>
              <input
                type="text"
                required
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                placeholder="Flat / Building, Street name"
                className="w-full border rounded-xl px-2.5 py-1.5 bg-white text-xs"
              />
            </div>

            {pincodeError && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-2 text-[10px] font-semibold text-rose-700">{pincodeError}</p>}
            {shippingInfo && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-[10px] text-emerald-800">
                <strong>Postal area identified.</strong> Courier coverage, shipping fees, COD availability and delivery dates are not connected to this portfolio demo.
              </div>
            )}
          </div>

          {/* Section 2: Payment Gateway Selection (Option 4) */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2.5">
            <label className="font-extrabold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <i className="fa-solid fa-credit-card text-orange-600"></i>
              2. Payment Method (Demo)
            </label>

            <div className="space-y-2">
              <label className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition ${paymentMethod === 'upi' ? 'bg-cyan-50/70 border-cyan-400 font-bold' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="payMethod"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={() => setPaymentMethod('upi')}
                    className="accent-cyan-600"
                  />
                  <span>Instant UPI (GPay, PhonePe, Paytm, CRED)</span>
                </div>
                <span className="text-[10px] bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded font-black">Zero Fee</span>
              </label>

              <label className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition ${paymentMethod === 'card' ? 'bg-cyan-50/70 border-cyan-400 font-bold' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="payMethod"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="accent-cyan-600"
                  />
                  <span>Credit / Debit Card (Visa, Mastercard, RuPay)</span>
                </div>
                <i className="fa-brands fa-cc-visa text-slate-500 text-base"></i>
              </label>

              <label className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition ${paymentMethod === 'cod' ? 'bg-cyan-50/70 border-cyan-400 font-bold' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="payMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="accent-cyan-600"
                  />
                  <span>Cash on Delivery (COD)</span>
                </div>
                <span className="text-[10px] text-slate-500">Pay at Doorstep</span>
              </label>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="bg-slate-100/70 p-3 rounded-xl border flex justify-between items-center text-sm font-black">
            <div>
              <span className="text-slate-600 text-xs block font-normal">Order Total ({cart.length} items)</span>
              <span>Final Payable:</span>
            </div>
            <span className="text-orange-600 text-lg">
              ₹{finalTotal.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Confirm Button */}
          <button
            type="submit"
            disabled={isProcessing || loadingPincode || !shippingInfo || cart.length === 0}
            className="w-full btn-primary py-3 rounded-xl font-bold text-sm shadow flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <i className="fa-solid fa-spinner animate-spin"></i>
                Securing Payment & Placing Order...
              </>
            ) : (
              (paymentMethod === 'cod' ? 'Place Demo COD Order' : `Simulate ${paymentMethod.toUpperCase()} · ₹${finalTotal.toLocaleString('en-IN')}`)
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
