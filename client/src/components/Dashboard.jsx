import React from 'react';
import { formatRupiah, PORT_NAMES, PORT_COLORS, getNextPort } from '../utils/gameHelpers';
import { Calendar, Wallet, AlertTriangle, ArrowRight, Anchor } from 'lucide-react';

export default function Dashboard({ week, currentPort, cash, accumulatedPenalties }) {
  const nextPort = getNextPort(currentPort);
  const currentPortFull = PORT_NAMES[currentPort];
  const nextPortFull = PORT_NAMES[nextPort];
  const portColorClass = PORT_COLORS[currentPort];
  const nextPortColorClass = PORT_COLORS[nextPort];
  
  return (
    <header className="w-full flex flex-col gap-4 mb-6 animate-slide-up">
      {/* Top Banner with Clean SPIL Corporate Header */}
      <div className="w-full glass-panel p-5 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* SPIL Red Flag Logo & Game Title */}
        <div className="flex items-center gap-4">
          {/* Official SPIL waved red flag logo in SVG */}
          <div className="w-16 h-12 flex items-center justify-center shrink-0">
            <svg 
              viewBox="0 0 100 65" 
              className="w-full h-full drop-shadow-sm select-none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Flag wave contour shape filled with SPIL Crimson Red */}
              <path 
                d="M 10 5 Q 30 15, 50 5 T 90 5 L 85 45 Q 65 45, 45 55 T 5 45 Z" 
                fill="#D21E20" 
                stroke="#B5181A"
                strokeWidth="1.5"
              />
              {/* Flagpole */}
              <rect x="3" y="2" width="4" height="60" fill="#94a3b8" rx="1" />
              <circle cx="5" cy="2" r="3" fill="#64748b" />
              {/* SPIL White Bold Text positioned inside the wave */}
              <text 
                x="45" 
                y="30" 
                fill="#FFFFFF" 
                fontSize="18" 
                fontWeight="900" 
                fontFamily="'Outfit', 'Inter', sans-serif"
                textAnchor="middle" 
                transform="rotate(6, 45, 30)"
                letterSpacing="1"
              >
                SPIL
              </text>
            </svg>
          </div>
          
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              SPIL Game: 4 Jalur
            </h1>
            <p className="text-xs text-slate-500 font-semibold tracking-wide uppercase">
              Optimasi Stowage & Pelayaran Kontainer
            </p>
          </div>
        </div>

        {/* Port Sailing Voyage Path */}
        <div className="flex items-center gap-3 bg-slate-100/80 px-4 py-2.5 rounded-xl border border-slate-200">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-bold uppercase tracking-wider">
            <Anchor className="w-3.5 h-3.5 text-spil-green" /> Asal
          </div>
          <span className={`px-3 py-1 rounded-lg text-xs font-extrabold uppercase bg-spil-green text-white shadow-sm`}>
            {currentPort}
          </span>
          
          <ArrowRight className="w-4 h-4 text-slate-400 animate-bounce-horizontal" />
          
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-bold uppercase tracking-wider">
            Pelabuhan Berikutnya
          </div>
          <span className={`px-3 py-1 rounded-lg text-xs font-extrabold uppercase bg-spil-green text-white shadow-sm`}>
            {nextPort}
          </span>
        </div>
      </div>

      {/* Numerical Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Week Tracker */}
        <div className="glass-panel p-4 flex items-center justify-between border-l-4 border-l-indigo-600 bg-white hover:shadow-md transition-all duration-300">
          <div>
            <span className="text-[10px] text-slate-500 font-extrabold tracking-wider uppercase block mb-1">
              Siklus Pelayaran
            </span>
            <span className="text-2xl font-black text-slate-800">
              Minggu {week} <span className="text-slate-400 text-sm font-bold">/ 8</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        {/* Cash Balance */}
        <div className="glass-panel p-4 flex items-center justify-between border-l-4 border-l-spil-green bg-white hover:shadow-md transition-all duration-300">
          <div>
            <span className="text-[10px] text-slate-500 font-extrabold tracking-wider uppercase block mb-1">
              Saldo Modal
            </span>
            <span className={`text-xl md:text-2xl font-black tracking-tight ${cash >= 0 ? 'text-spil-green' : 'text-spil-red'}`}>
              {formatRupiah(cash)}
            </span>
          </div>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
            cash >= 0 
              ? 'bg-emerald-50 border-emerald-100 text-spil-green' 
              : 'bg-rose-50 border-rose-100 text-spil-red'
          }`}>
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        {/* Accumulated Penalties */}
        <div className="glass-panel p-4 flex items-center justify-between border-l-4 border-l-spil-red bg-white hover:shadow-md transition-all duration-300">
          <div>
            <span className="text-[10px] text-slate-500 font-extrabold tracking-wider uppercase block mb-1">
              Denda Pelayaran
            </span>
            <span className={`text-xl md:text-2xl font-black tracking-tight ${accumulatedPenalties > 0 ? 'text-spil-red' : 'text-slate-400'}`}>
              {formatRupiah(accumulatedPenalties)}
            </span>
          </div>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
            accumulatedPenalties > 0 
              ? 'bg-rose-50 border-rose-150 text-spil-red' 
              : 'bg-slate-100 border-slate-200 text-slate-400'
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Vessel Route Path */}
        <div className="glass-panel p-4 flex items-center justify-between border-l-4 border-l-slate-400 bg-white hover:shadow-md transition-all duration-300">
          <div>
            <span className="text-[10px] text-slate-500 font-extrabold tracking-wider uppercase block mb-1">
              Rute Loop Aktif
            </span>
            <span className="text-xs font-black text-slate-700 block leading-tight">
              SBY &rarr; MKS &rarr; JYP &rarr; MDN &rarr; SBY
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
            <Anchor className="w-5 h-5" />
          </div>
        </div>
      </div>
    </header>
  );
}
