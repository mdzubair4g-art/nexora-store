import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

export function InventoryManager({ onProductUpdated }) {
  const [products, setProducts] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [savedId, setSavedId] = useState(null);
  const [error, setError] = useState('');

  const loadProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getProducts({ sort: 'featured' });
      const list = data.products || [];
      setProducts(list);
      setDrafts(Object.fromEntries(list.map(product => [
        product.id,
        { price: String(product.price), mrp: String(product.mrp), stock: String(product.stock) }
      ])));
    } catch (err) {
      setError(err.message || 'Could not load catalogue inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProducts(); }, []);

  const updateDraft = (id, field, value) => {
    setSavedId(null);
    setDrafts(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const saveProduct = async (event, product) => {
    event.preventDefault();
    const draft = drafts[product.id];
    const price = Number(draft?.price);
    const mrp = Number(draft?.mrp);
    const stock = Number(draft?.stock);

    if (!Number.isSafeInteger(price) || price < 1 || !Number.isSafeInteger(mrp) || mrp < price ||
      !Number.isSafeInteger(stock) || stock < 0 || stock > 1000000) {
      setError('Enter whole-number prices, set MRP equal to or above the selling price, and use stock from 0 to 1,000,000.');
      return;
    }

    setSavingId(product.id);
    setError('');
    setSavedId(null);
    try {
      const updated = await api.updateProduct(product.id, { price, mrp, stock });
      setProducts(prev => prev.map(item => item.id === product.id ? updated : item));
      setDrafts(prev => ({
        ...prev,
        [product.id]: { price: String(updated.price), mrp: String(updated.mrp), stock: String(updated.stock) }
      }));
      setSavedId(product.id);
      onProductUpdated?.(updated);
    } catch (err) {
      setError(err.message || 'Could not save product changes.');
    } finally {
      setSavingId(null);
    }
  };

  if (loading) return <div className="py-12 text-center text-sm text-slate-500" role="status">Loading catalogue inventory…</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-cyan-100 bg-cyan-50 px-4 py-3">
        <div>
          <div className="text-sm font-black text-slate-900">Inventory control</div>
          <p className="mt-0.5 text-[11px] text-slate-600">Update sample selling prices, MRP and stock. Changes are saved through the admin API.</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-black text-cyan-800">{products.length}</div>
          <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Products</div>
        </div>
      </div>

      {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">{error}</div>}

      {products.length === 0 ? (
        <div className="py-10 text-center text-sm text-slate-500">There are no products to manage yet.</div>
      ) : (
        <div className="max-h-[52vh] space-y-3 overflow-y-auto pr-1">
          {products.map(product => {
            const draft = drafts[product.id] || { price: '', mrp: '', stock: '' };
            const stock = Number(draft.stock);
            return (
              <form key={product.id} onSubmit={(event) => saveProduct(event, product)} className="rounded-xl border border-slate-200 p-3 sm:p-4">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-slate-50 p-1.5">
                    <img src={product.image || '/nexora-placeholder.svg'} alt="" onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = '/nexora-placeholder.svg';
                    }} className="max-h-full max-w-full object-contain" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="line-clamp-2 text-xs font-black text-slate-900">{product.title}</div>
                    <div className="mt-0.5 text-[10px] text-slate-500">{product.brand} · {product.category}</div>
                  </div>
                  <span className={(stock <= 0 ? 'bg-rose-100 text-rose-700' : stock <= 5 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-700') + ' shrink-0 rounded-full px-2 py-1 text-[10px] font-bold'}>
                    {stock <= 0 ? 'Out of stock' : stock <= 5 ? 'Low stock' : 'In stock'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <label className="text-[10px] font-bold text-slate-500">Selling price (₹)
                    <input required type="number" min="1" max="100000000" step="1" value={draft.price} onChange={(event) => updateDraft(product.id, 'price', event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-cyan-500" />
                  </label>
                  <label className="text-[10px] font-bold text-slate-500">MRP (₹)
                    <input required type="number" min="1" max="100000000" step="1" value={draft.mrp} onChange={(event) => updateDraft(product.id, 'mrp', event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-cyan-500" />
                  </label>
                  <label className="text-[10px] font-bold text-slate-500">Stock units
                    <input required type="number" min="0" max="1000000" step="1" value={draft.stock} onChange={(event) => updateDraft(product.id, 'stock', event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-cyan-500" />
                  </label>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-400">Product ID: {product.id}</span>
                  <button type="submit" disabled={savingId === product.id} className="rounded-lg bg-slate-900 px-3 py-2 text-[11px] font-bold text-white transition hover:bg-slate-700 disabled:cursor-wait disabled:opacity-60">
                    {savingId === product.id ? 'Saving…' : savedId === product.id ? 'Saved' : 'Save changes'}
                  </button>
                </div>
              </form>
            );
          })}
        </div>
      )}

      <div className="flex justify-end">
        <button type="button" onClick={loadProducts} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">Refresh inventory</button>
      </div>
    </div>
  );
}
