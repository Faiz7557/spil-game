import React from 'react';
import { formatRupiah, PORT_NAMES } from '../utils/gameHelpers';
import { AlertCircle, Trash2, PhoneCall, Ship, Check } from 'lucide-react';

export default function SalesCall({ orders, onAccept, onDecline }) {
  return (
    <section className="glass-panel p-6 mb-6 animate-slide-up bg-white border border-slate-200/90 shadow-sm relative overflow-hidden">
      {/* Decorative background blur */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full blur-2xl pointer-events-none"></div>

      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 border-b border-slate-100 pb-4 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-650 shadow-sm shrink-0">
            <PhoneCall className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2 font-display">
              Pasar Kargo Bersama (Shared Cargo Pool)
            </h2>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">
              Klik klaim secara cepat! Penawaran kargo yang diklaim kapten lain akan otomatis hilang dari layar Anda.
            </p>
          </div>
        </div>
        <span className="text-xs font-black text-indigo-750 bg-indigo-50 border border-indigo-150 px-3.5 py-1.5 rounded-full shrink-0 shadow-inner">
          {orders.length} Kontrak Tersedia
        </span>
      </div>

      {/* Cargo List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 max-h-[380px] overflow-y-auto pr-1.5 scrollbar-thin">
        {orders.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 font-bold text-sm bg-slate-50/50 rounded-2xl border border-dashed border-slate-300">
            <Ship className="w-10 h-10 mx-auto text-slate-350 mb-2" />
            Tidak ada kargo yang tersisa di pasar.
            <span className="text-[10px] text-slate-400 block mt-1 uppercase font-black">Kapal Anda siap diberangkatkan!</span>
          </div>
        ) : (
          orders.map(order => {
            const isCommitted = order.customerType === 'Committed';
            const isReefer = order.containerType === 'REEFER';
            const portName = PORT_NAMES[order.destination];
            
            return (
              <div 
                key={order.id} 
                className={`rounded-2xl p-5 border-y border-r border-l-4 transition-all duration-300 flex flex-col justify-between hover:shadow-md hover:scale-[1.01] bg-white ${
                  isCommitted 
                    ? 'border-slate-250 border-l-spil-red bg-rose-50/20 hover:border-rose-300'
                    : 'border-slate-255 border-l-spil-green hover:border-slate-300'
                }`}
              >
                {/* Header: Customer and Contract Badge */}
                <div className="flex justify-between items-center gap-3 mb-3.5">
                  <div className="truncate">
                    <h4 className="text-xs font-black text-slate-800 truncate" title={order.customerName}>
                      {order.customerName}
                    </h4>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                      Ref: {order.id.split('_').slice(-2).join('-')}
                    </span>
                  </div>
                  
                  {isCommitted ? (
                    <span className="text-[8px] font-black tracking-widest px-2 py-1 rounded bg-spil-red text-white shadow-sm shrink-0 uppercase">
                      COMMITTED
                    </span>
                  ) : (
                    <span className="text-[8px] font-black tracking-widest px-2 py-1 rounded bg-sky-50 border border-sky-250 text-sky-700 shadow-sm shrink-0 uppercase">
                      REGULAR
                    </span>
                  )}
                </div>

                {/* Logistics details table */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50/70 p-3 rounded-xl border border-slate-200/65 mb-4">
                  <div>
                    <span className="text-[9px] text-slate-400 font-black block uppercase tracking-wider">
                      Tipe Kargo
                    </span>
                    <span className={`font-black text-xs uppercase flex items-center gap-1 mt-0.5 ${isReefer ? 'text-sky-700' : 'text-amber-700'}`}>
                      {order.containerType}
                      <span className="text-slate-500 font-bold">({order.quantity}x)</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-black block uppercase tracking-wider">
                      Tujuan Port
                    </span>
                    <span className="font-black text-slate-700 uppercase truncate block mt-0.5" title={`${order.destination} - ${portName}`}>
                      {order.destination} <span className="text-[9.5px] font-normal text-slate-400">({portName})</span>
                    </span>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-slate-200 flex justify-between items-center mt-1">
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider">
                      Uang Tambang (Tarif)
                    </span>
                    <span className="font-extrabold text-emerald-700 text-sm">
                      {formatRupiah(order.tariff)} <span className="text-[9px] font-normal text-slate-450">/ unit</span>
                    </span>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-2 items-center">
                  {/* Claim Button */}
                  <button
                    onClick={() => onAccept(order.id)}
                    className={`flex-grow py-2 text-[10px] font-black rounded-lg shadow-sm border transition-all duration-200 uppercase tracking-widest text-white hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-1 ${
                      isCommitted
                        ? 'bg-spil-red hover:bg-spil-red-hover border-spil-red'
                        : 'bg-spil-green hover:bg-spil-green-hover border-spil-green'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    Klaim Kargo
                  </button>
                  
                  {/* Decline Button (Only for Regular) */}
                  {!isCommitted ? (
                    <button
                      onClick={() => onDecline(order.id)}
                      className="px-2.5 py-2 rounded-lg bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-250 text-slate-450 hover:text-spil-red transition-all duration-200 shrink-0"
                      title="Tolak Penawaran Kargo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <div 
                      className="px-2.5 py-2 bg-rose-50/50 border border-rose-100 text-spil-red rounded-lg flex items-center justify-center shrink-0"
                      title="Kontrak Committed wajib diperebutkan bersama."
                    >
                      <AlertCircle className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Penalty info bar */}
                <div className="mt-3.5 text-[8.5px] text-slate-400 font-black border-t border-slate-100 pt-2.5 flex justify-between uppercase select-none">
                  <span>Denda Gagal Muat:</span>
                  <span className="text-spil-red font-black">
                    {isCommitted 
                      ? (isReefer ? 'Rp 24M (Bersama)' : 'Rp 16M (Bersama)')
                      : (isReefer ? 'Rp 16M (Klaim)' : 'Rp 8M (Klaim)')}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
