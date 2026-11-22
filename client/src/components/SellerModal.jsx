import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { InventoryManager } from './InventoryManager';

const DEPARTMENTS = [
  'Mobiles & Tablets',
  'Laptops & Audio',
  'Fashion & Sneakers',
  'Home & Kitchen',
  'Beauty & Grooming',
  'Fitness & Sports',
  'Books & Desk',
  'Gaming & Consoles'
];

export function SellerModal({ isOpen, onClose, onProductPublished }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('publish');
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('Mobiles & Tablets');
  const [price, setPrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [image, setImage] = useState('');
  const [highlight, setHighlight] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!title.trim() || !price) return;

    setLoading(true);
    try {
      const created = await api.createProduct({
        title: title.trim(),
        brand: brand.trim() || 'NEXORA Studio',
        category,
        collection: 'Work From Home Setup',
        price: Number(price),
        mrp: mrp ? Number(mrp) : Number(price) + 1200,
        image: image.trim(),
        highlights: highlight.trim() ? [highlight.trim()] : ['Sample product listing']
      });

      onProductPublished(created);
      onClose();
      setTitle('');
      setBrand('');
      setPrice('');
      setMrp('');
      setImage('');
      setHighlight('');
    } catch (err) {
      alert('Publishing failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-3 sm:p-5">
      <section role="dialog" aria-modal="true" aria-labelledby="sellerHeading" className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-store text-lg text-cyan-600" aria-hidden="true"></i>
            <div>
              <h2 id="sellerHeading" className="text-lg font-black text-slate-900">NEXORA Seller Studio</h2>
              <p className="text-[11px] text-slate-500">Admin tools for the sample catalogue</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close Seller Studio" className="rounded-lg px-3 py-2 text-xl text-slate-400 hover:bg-slate-100 hover:text-slate-800">×</button>
        </header>

        {!user || user.role !== 'admin' ? (
          <div className="p-8 text-center">
            <i className="fa-solid fa-lock mb-3 text-3xl text-slate-300" aria-hidden="true"></i>
            <h3 className="font-black text-slate-900">Admin access required</h3>
            <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">Sign in with an administrator account to publish sample products or manage inventory.</p>
            <button type="button" onClick={onClose} className="mt-4 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white">Close</button>
          </div>
        ) : (
          <>
            <div className="flex gap-2 border-b border-slate-100 px-5 py-3">
              <button type="button" onClick={() => setActiveTab('publish')} aria-pressed={activeTab === 'publish'} className={(activeTab === 'publish' ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200') + ' rounded-lg px-4 py-2 text-xs font-bold'}>Publish product</button>
              <button type="button" onClick={() => setActiveTab('inventory')} aria-pressed={activeTab === 'inventory'} className={(activeTab === 'inventory' ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200') + ' rounded-lg px-4 py-2 text-xs font-bold'}>Manage inventory</button>
            </div>

            <div className="overflow-y-auto p-5">
              {activeTab === 'publish' ? (
                <div className="mx-auto max-w-xl">
                  <p className="mb-4 text-xs text-slate-500">Add a sample item to the demo catalogue. This does not connect to a real supplier.</p>
                  <form onSubmit={handleSubmit} className="space-y-3 text-sm">
                    <input type="text" required maxLength="160" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Product title" className="w-full rounded-xl border px-3 py-2 outline-none focus:border-cyan-500" />

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <input type="text" maxLength="80" value={brand} onChange={(event) => setBrand(event.target.value)} placeholder="Brand name" className="w-full rounded-xl border px-3 py-2 outline-none focus:border-cyan-500" />
                      <select value={category} onChange={(event) => setCategory(event.target.value)} className="w-full rounded-xl border bg-white px-3 py-2 text-xs font-semibold outline-none">
                        {DEPARTMENTS.map(department => <option key={department} value={department}>{department}</option>)}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <input type="number" required min="1" step="1" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="Sample price (₹)" className="w-full rounded-xl border px-3 py-2 outline-none focus:border-cyan-500" />
                      <input type="number" min="1" step="1" value={mrp} onChange={(event) => setMrp(event.target.value)} placeholder="Sample MRP (₹)" className="w-full rounded-xl border px-3 py-2 outline-none focus:border-cyan-500" />
                    </div>

                    <input type="url" value={image} onChange={(event) => setImage(event.target.value)} placeholder="Image URL (direct image link)" className="w-full rounded-xl border px-3 py-2 text-xs outline-none focus:border-cyan-500" />
                    <input type="text" maxLength="160" value={highlight} onChange={(event) => setHighlight(event.target.value)} placeholder="Key product highlight" className="w-full rounded-xl border px-3 py-2 text-xs outline-none focus:border-cyan-500" />

                    <button type="submit" disabled={loading} className="btn-cyan w-full rounded-xl py-3 text-xs font-bold shadow disabled:opacity-50">
                      {loading ? 'Saving sample item…' : 'Publish to catalogue'}
                    </button>
                  </form>
                </div>
              ) : (
                <InventoryManager onProductUpdated={onProductPublished} />
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
