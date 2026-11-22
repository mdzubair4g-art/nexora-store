import React from 'react';

const DEPARTMENTS = [
  { name: 'Mobiles & Tablets', icon: 'fa-mobile-screen-button', bg: 'bg-indigo-100', text: 'text-indigo-700', hover: 'hover:bg-indigo-50' },
  { name: 'Laptops & Audio', icon: 'fa-headphones', bg: 'bg-cyan-100', text: 'text-cyan-700', hover: 'hover:bg-cyan-50' },
  { name: 'Fashion & Sneakers', icon: 'fa-shoe-prints', bg: 'bg-orange-100', text: 'text-orange-700', hover: 'hover:bg-orange-50' },
  { name: 'Home & Kitchen', icon: 'fa-blender', bg: 'bg-emerald-100', text: 'text-emerald-700', hover: 'hover:bg-emerald-50' },
  { name: 'Beauty & Grooming', icon: 'fa-wand-magic-sparkles', bg: 'bg-rose-100', text: 'text-rose-700', hover: 'hover:bg-rose-50' },
  { name: 'Fitness & Sports', icon: 'fa-dumbbell', bg: 'bg-teal-100', text: 'text-teal-700', hover: 'hover:bg-teal-50' },
  { name: 'Books & Desk', icon: 'fa-book-open', bg: 'bg-amber-100', text: 'text-amber-700', hover: 'hover:bg-amber-50' },
  { name: 'Gaming & Consoles', icon: 'fa-gamepad', bg: 'bg-purple-100', text: 'text-purple-700', hover: 'hover:bg-purple-50' },
];

export function DepartmentGrid({ onSelectCategory, onResetCategory }) {
  return (
    <section className="max-w-[1440px] mx-auto px-3 md:px-6 pt-5">
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
            Shop by Department (8 Collections)
          </h2>
          <button
            onClick={onResetCategory}
            type="button"
            className="text-xs font-bold text-cyan-700 hover:underline transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600"
          >
            View All
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {DEPARTMENTS.map(dept => (
            <button
              key={dept.name}
              type="button"
              onClick={() => onSelectCategory(dept.name)}
              aria-label={`Browse ${dept.name}`}
              className={`group p-3 rounded-xl bg-slate-50 ${dept.hover} border border-slate-100 text-center transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600`}
            >
              <div className={`w-10 h-10 mx-auto rounded-xl ${dept.bg} ${dept.text} flex items-center justify-center text-lg transition group-hover:scale-110`}>
                <i className={`fa-solid ${dept.icon}`}></i>
              </div>
              <div className="text-xs font-bold mt-2 text-slate-800 group-hover:text-indigo-900 line-clamp-1">
                {dept.name}
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
