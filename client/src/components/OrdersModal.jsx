import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export function OrdersModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api.getOrders()
        .then(data => setOrders(data.orders || []))
        .catch(err => console.error('Failed to load orders:', err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, user?.email]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-xl text-slate-400 hover:text-slate-600 transition"
        >
          &times;
        </button>

        <div className="flex items-center gap-2 mb-1">
          <i className="fa-solid fa-truck-ramp-box text-cyan-600 text-lg"></i>
          <h3 className="text-xl font-black text-slate-900">Order History & Status</h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Your order history is linked to your signed-in account.
        </p>

        <div className="flex-1 overflow-y-auto space-y-4">
          {loading ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              <i className="fa-solid fa-spinner animate-spin text-lg block mb-2"></i>
              Loading your orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center text-slate-500 text-sm py-12">
              <i className="fa-solid fa-box-open text-4xl text-slate-300 block mb-2"></i>
              No orders placed yet.
            </div>
          ) : (
            orders.map(o => (
              <div key={o.orderId} className="border border-slate-200 rounded-2xl overflow-hidden text-xs shadow-sm">
                <div className="bg-slate-100 px-4 py-2.5 flex flex-wrap justify-between gap-2 border-b">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Order Date</span>
                    <strong className="text-slate-800">{o.date}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Order Total</span>
                    <strong className="text-slate-900">₹{o.totalAmount.toLocaleString('en-IN')}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Order Reference</span>
                    <strong className="text-indigo-700 font-mono">{o.orderId}</strong>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="bg-cyan-50 border border-cyan-100 p-3 rounded-xl flex flex-wrap items-center gap-2">
                    <span className="inline-flex rounded-full bg-white text-cyan-800 border border-cyan-200 px-2.5 py-1 font-bold">
                      {o.status || 'Confirmed'}
                    </span>
                    <span className="text-[11px] text-slate-600">
                      Order received. Shipment tracking will appear after a delivery partner is connected.
                    </span>
                  </div>

                  <div className="text-slate-600 text-[11px]">
                    Status: <strong className="text-slate-900">{o.status}</strong> • Delivering to: <strong className="text-slate-900">{o.shippingAddress}</strong> • Payment via: <strong className="text-slate-900">{o.paymentMethod}</strong>
                  </div>

                  <div className="space-y-1.5 pt-1 border-t">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Purchased Items:</span>
                    {o.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-slate-900 font-semibold">
                        <span className="truncate max-w-[280px]">
                          {item.title} ({item.variant}) × {item.qty}
                        </span>
                        <span>₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
