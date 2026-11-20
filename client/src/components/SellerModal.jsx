import React, { useState } from 'react';
import { api } from '../services/api';

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
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('Mobiles & Tablets');
  const [price, setPrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [image, setImage] = useState('');
  const [highlight, setHighlight] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        highlights: highlight.trim() ? [highlight.trim()] : ['Verified marketplace listing']
      });

      onProductPublished(created);
      onClose();
      // Reset form
      setTitle('');
      setBrand('');
      setPrice('');
      setMrp('');
      setImage('');
      setHighlight('');
    } catch (err) {
      alert(`Publishing failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-xl text-slate-400 hover:text-slate-600 transition"
        >
          &times;
        </button>

        <div className="flex items-center gap-2 mb-1">
          <i className="fa-solid fa-store text-cyan-600 text-lg"></i>
          <h3 className="text-lg font-black text-slate-900">NEXORA Seller Studio</h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Publish a new item directly to the live SQLite catalog.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3 text-sm">
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Product Title"
            className="w-full border rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-cyan-500"
          />

          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Brand Name"
              className="w-full border rounded-xl px-3 py-2 outline-none"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border rounded-xl px-3 py-2 outline-none bg-white text-xs font-semibold"
            >
              {DEPARTMENTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Offer Price (₹)"
              className="w-full border rounded-xl px-3 py-2 outline-none"
            />
            <input
              type="number"
              value={mrp}
              onChange={(e) => setMrp(e.target.value)}
              placeholder="MRP (₹)"
              className="w-full border rounded-xl px-3 py-2 outline-none"
            />
          </div>

          <input
            type="url"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="Image URL (Unsplash or direct image link)"
            className="w-full border rounded-xl px-3 py-2 outline-none text-xs"
          />

          <input
            type="text"
            value={highlight}
            onChange={(e) => setHighlight(e.target.value)}
            placeholder="Key Product Highlight (e.g. 50MP Sony Camera)"
            className="w-full border rounded-xl px-3 py-2 outline-none text-xs"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-cyan py-2.5 rounded-xl font-bold text-xs shadow disabled:opacity-50"
          >
            {loading ? 'Publishing to Database...' : 'Publish to Catalog'}
          </button>
        </form>
      </div>
    </div>
  );
}
