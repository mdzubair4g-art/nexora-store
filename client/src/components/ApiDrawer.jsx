import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export function ApiDrawer({ isOpen, onClose }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await api.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch API stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStats();
      const interval = setInterval(fetchStats, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[94vw] max-w-lg bg-slate-950 text-slate-100 rounded-2xl shadow-2xl border border-cyan-500/40 overflow-hidden animate-in slide-in-from-bottom duration-300">
      <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 font-bold text-cyan-400">
          <i className="fa-solid fa-server"></i>
          <span>NEXORA REST API & SQLite Engine Inspector</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchStats}
            className="text-[10px] text-slate-400 hover:text-cyan-300 transition"
            title="Refresh logs"
          >
            <i className={`fa-solid fa-rotate-right ${loading ? 'animate-spin' : ''}`}></i>
          </button>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg leading-none transition"
          >
            &times;
          </button>
        </div>
      </div>

      <div className="p-3.5 space-y-3 text-[11px]">
        {/* Real SQLite Stats Grid */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
            <div className="text-slate-400 text-[10px]">Products</div>
            <div className="text-sm font-black text-cyan-400">
              {stats?.counts?.products ?? '...'}
            </div>
          </div>
          <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
            <div className="text-slate-400 text-[10px]">Users</div>
            <div className="text-sm font-black text-emerald-400">
              {stats?.counts?.users ?? '...'}
            </div>
          </div>
          <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
            <div className="text-slate-400 text-[10px]">Orders</div>
            <div className="text-sm font-black text-orange-400">
              {stats?.counts?.orders ?? '...'}
            </div>
          </div>
          <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
            <div className="text-slate-400 text-[10px]">Reviews</div>
            <div className="text-sm font-black text-purple-400">
              {stats?.counts?.reviews ?? '...'}
            </div>
          </div>
        </div>

        {/* Live REST API Stream */}
        <div className="flex justify-between items-center text-slate-400 font-bold text-[10px] uppercase tracking-wider">
          <span>Live SQLite REST API Traffic:</span>
          <span className="text-emerald-400 flex items-center gap-1 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            PORT :5000 ACTIVE
          </span>
        </div>

        <div className="h-36 overflow-y-auto bg-black/70 rounded-xl p-2.5 font-mono text-[10px] space-y-1.5 text-emerald-300 border border-slate-800/80">
          {!stats?.logs || stats.logs.length === 0 ? (
            <div className="text-slate-500 py-4 text-center">No traffic logged yet.</div>
          ) : (
            stats.logs.map(l => (
              <div key={l.id} className="flex items-baseline gap-2">
                <span className="text-slate-500 shrink-0">[{l.timestamp}]</span>
                <span className={`font-bold ${
                  l.method === 'GET' ? 'text-cyan-400' :
                  l.method === 'POST' ? 'text-amber-400' : 'text-purple-400'
                }`}>
                  {l.method}
                </span>
                <span className="text-slate-200">{l.endpoint}</span>
                <span className="text-slate-400">→</span>
                <span className="text-emerald-400 font-bold">{l.statusCode}</span>
                <span className="text-slate-400 truncate max-w-[150px]">({l.details})</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
