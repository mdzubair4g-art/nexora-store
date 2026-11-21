import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export function AuthModal({ isOpen, onClose }) {
  const { login, register, user, logout } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-xl text-slate-400 hover:text-slate-600 transition"
        >
          &times;
        </button>

        {user ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center text-2xl mx-auto font-black">
              {user.name[0].toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">{user.name}</h3>
              <p className="text-xs text-slate-500">{user.email}</p>
              <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1">
                Active Session
              </span>
            </div>
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="w-full bg-rose-50 text-rose-600 border border-rose-200 py-2 rounded-xl text-xs font-bold hover:bg-rose-100 transition"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <>
            <div className="flex border-b mb-4">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); }}
                className={`flex-1 py-2 text-xs font-bold border-b-2 transition ${
                  mode === 'login' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-400'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setError(''); }}
                className={`flex-1 py-2 text-xs font-bold border-b-2 transition ${
                  mode === 'register' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-400'
                }`}
              >
                Join NEXORA
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              {mode === 'login'
                ? 'Sign in to access your saved wishlist and order history.'
                : 'Create an account to save products and place Cash on Delivery orders.'}
            </p>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-2.5 rounded-xl text-xs mb-3 font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-bold mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Password</label>
                {mode === 'register' && (
                  <p className="text-[10px] text-slate-500 mb-1">Use at least 10 characters.</p>
                )}
                <input
                  type="password"
                  required
                  minLength={mode === 'register' ? 10 : 1}
                  maxLength={72}
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-2.5 rounded-xl font-bold text-sm shadow disabled:opacity-50"
              >
                {loading ? 'Processing...' : (mode === 'login' ? 'Continue' : 'Create Account')}
              </button>
            </form>

            {import.meta.env.DEV && (
              <div className="mt-4 pt-3 border-t text-[11px] text-slate-400 text-center">
                Local demo: <strong>alex@nexora.in</strong> / <strong>nexora123</strong>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
