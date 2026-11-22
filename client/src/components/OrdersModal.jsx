import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export function OrdersModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    if (!user) {
      setOrders([]);
      setError('');
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError('');
    api.getOrders(user.email)
      .then(data => { if (active) setOrders(data.orders || []); })
      .catch(err => { if (active) setError(err.message || 'Could not load your orders.'); })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [isOpen, user?.email]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="presentation">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="ordersHeading"
        className="relative flex max-h-[85vh] w-full max-w-xl flex-col rounded-2xl bg-white p-6 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close order history"
          className="absolute right-4 top-3 text-2xl leading-none text-slate-400 transition hover:text-slate-700"
        >
          &times;
        </button>

        <div className="mb-1 flex items-center gap-2">
          <i className="fa-solid fa-box-open text-lg text-cyan-600" aria-hidden="true"></i>
          <h3 id="ordersHeading" className="text-xl font-black text-slate-900">Your Orders</h3>
        </div>
        <p className="mb-4 text-xs text-slate-500">
          Demo order records saved to the project database. Courier tracking is not connected.
        </p>

        <div className="flex-1 space-y-4 overflow-y-auto">
          {!user ? (
            <div className="py-12 text-center text-sm text-slate-600">
              <i className="fa-solid fa-user-lock mb-3 block text-3xl text-slate-300" aria-hidden="true"></i>
              Sign in to view your order history.
            </div>
          ) : loading ? (
            <div className="py-12 text-center text-xs text-slate-500" role="status">
              <i className="fa-solid fa-spinner mb-2 block animate-spin text-lg" aria-hidden="true"></i>
              Loading your orders…
            </div>
          ) : error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-center" role="alert">
              <p className="text-sm text-rose-700">{error}</p>
              <button
                type="button"
                onClick={() => {
                  setLoading(true);
                  setError('');
                  api.getOrders(user.email)
                    .then(data => setOrders(data.orders || []))
                    .catch(err => setError(err.message || 'Could not load your orders.'))
                    .finally(() => setLoading(false));
                }}
                className="mt-3 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white"
              >
                Try again
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              <i className="fa-solid fa-box-open mb-3 block text-4xl text-slate-300" aria-hidden="true"></i>
              No demo orders yet.
            </div>
          ) : (
            orders.map(order => (
              <article key={order.orderId} className="overflow-hidden rounded-2xl border border-slate-200 text-xs shadow-sm">
                <div className="flex flex-wrap justify-between gap-3 border-b bg-slate-100 px-4 py-3">
                  <div>
                    <span className="block text-[10px] uppercase text-slate-500">Order date</span>
                    <strong className="text-slate-800">{order.date}</strong>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase text-slate-500">Order total</span>
                    <strong className="text-slate-900">₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}</strong>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase text-slate-500">Reference</span>
                    <strong className="font-mono text-indigo-700">{order.orderId}</strong>
                  </div>
                </div>

                <div className="space-y-3 p-4">
                  <div className="rounded-xl border border-cyan-100 bg-cyan-50 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-slate-700">Demo order status</span>
                      <span className="rounded-full bg-white px-2.5 py-1 font-bold text-cyan-800">
                        {order.status || order.trackingStage || 'Received'}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-600">
                      This status is illustrative. No courier has been booked and no live delivery tracking is available.
                    </p>
                  </div>

                  <div className="text-[11px] leading-relaxed text-slate-600">
                    Delivery address: <strong className="text-slate-900">{order.shippingAddress}</strong>
                    <br />
                    Payment method: <strong className="text-slate-900">{order.paymentMethod}</strong>
                    {' · '}
                    Payment status: <strong className="text-slate-900">{order.paymentStatus}</strong>
                  </div>

                  <div className="space-y-2 border-t pt-3">
                    <span className="block text-[10px] font-bold uppercase text-slate-400">Items in this order</span>
                    {(order.items || []).map((item, index) => (
                      <div key={`${item.id}-${item.variant}-${index}`} className="flex items-start justify-between gap-3 font-semibold text-slate-800">
                        <span className="min-w-0">{item.title} ({item.variant}) × {item.qty}</span>
                        <span className="shrink-0">₹{(Number(item.price) * Number(item.qty)).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
