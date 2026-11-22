import React from 'react';

export function ComparePanel({ items = [], isOpen, onOpen, onClose, onRemove, onClear }) {
  if (!items.length) return null;

  const rows = [
    { label: 'Brand', render: product => product.brand || '—' },
    { label: 'Category', render: product => product.category || '—' },
    { label: 'Selling price', render: product => '₹' + Number(product.price || 0).toLocaleString('en-IN') },
    { label: 'Listed MRP', render: product => '₹' + Number(product.mrp || 0).toLocaleString('en-IN') },
    { label: 'Rating', render: product => (Number(product.rating) > 0 ? Number(product.rating).toFixed(1) + ' / 5' : 'Not rated') },
    { label: 'Sample reviews', render: product => Number(product.reviewsCount || 0).toLocaleString('en-IN') },
    { label: 'Stock', render: product => (Number(product.stock) > 0 ? Number(product.stock) + ' available' : 'Out of stock') },
    { label: 'Variants', render: product => Array.isArray(product.variants) && product.variants.length ? product.variants.join(', ') : 'Standard' },
    { label: 'Highlights', render: product => Array.isArray(product.highlights) && product.highlights.length ? product.highlights.join(' • ') : '—' }
  ];

  return (
    <>
      <div className="fixed bottom-3 left-1/2 z-40 flex w-[calc(100%-24px)] max-w-2xl -translate-x-1/2 items-center justify-between gap-3 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white shadow-2xl">
        <div className="min-w-0">
          <div className="text-xs font-black">{items.length} of 3 products selected</div>
          <div className="mt-0.5 truncate text-[11px] text-slate-300">
            {items.map(item => item.title).join(' · ')}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" onClick={onClear} className="rounded-lg px-2 py-2 text-[11px] font-bold text-slate-300 transition hover:bg-white/10">Clear</button>
          <button
            type="button"
            disabled={items.length < 2}
            onClick={onOpen}
            className="rounded-xl bg-cyan-500 px-3 py-2 text-xs font-black text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            Compare now
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/75 p-3 sm:p-6" role="presentation">
          <section role="dialog" aria-modal="true" aria-labelledby="compareHeading" className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <div>
                <h2 id="compareHeading" className="text-lg font-black text-slate-900">Product comparison</h2>
                <p className="mt-0.5 text-xs text-slate-500">Compare prices, ratings, stock and product details side by side.</p>
              </div>
              <button type="button" onClick={onClose} aria-label="Close comparison" className="rounded-lg px-3 py-2 text-xl text-slate-400 hover:bg-slate-100 hover:text-slate-800">×</button>
            </header>

            <div className="overflow-auto p-4 sm:p-5">
              <table className="w-full min-w-[620px] border-collapse text-left text-xs">
                <thead>
                  <tr>
                    <th className="w-32 border-b border-slate-200 p-3 text-slate-500">Product</th>
                    {items.map(product => (
                      <th key={product.id} className="min-w-[180px] border-b border-slate-200 p-3 align-top">
                        <div className="mb-2 flex h-28 items-center justify-center rounded-xl bg-slate-50 p-2">
                          <img
                            src={product.image || '/nexora-placeholder.svg'}
                            alt={product.title}
                            onError={(event) => {
                              event.currentTarget.onerror = null;
                              event.currentTarget.src = '/nexora-placeholder.svg';
                            }}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <div className="line-clamp-2 min-h-8 font-black text-slate-900">{product.title}</div>
                        <button type="button" onClick={() => onRemove(product.id)} className="mt-2 text-[11px] font-bold text-rose-600 hover:underline">Remove</button>
                      </th>
                    ))}
                    {items.length < 3 && <th className="min-w-[150px] border-b border-slate-200 p-3 text-center font-medium text-slate-400">Add another product from the catalogue</th>}
                  </tr>
                </thead>
                <tbody>
                  {rows.map(row => (
                    <tr key={row.label} className="odd:bg-slate-50">
                      <th scope="row" className="border-b border-slate-100 p-3 font-bold text-slate-600">{row.label}</th>
                      {items.map(product => <td key={product.id} className="border-b border-slate-100 p-3 align-top text-slate-800">{row.render(product)}</td>)}
                      {items.length < 3 && <td className="border-b border-slate-100 p-3" />}
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-3 text-[11px] text-slate-500">Catalogue prices, ratings and stock are sample portfolio data, not verified live seller information.</p>
            </div>

            <footer className="flex justify-end border-t border-slate-100 px-5 py-3">
              <button type="button" onClick={onClose} className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-700">Done</button>
            </footer>
          </section>
        </div>
      )}
    </>
  );
}
