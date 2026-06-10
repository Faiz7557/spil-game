import React from 'react';
import { formatRupiah, PORT_NAMES } from '../utils/gameHelpers';
import { AlertCircle, CheckCircle, Trash2, HelpCircle } from 'lucide-react';

export default function SalesCall({ orders, onAccept, onDecline }) {
  return (
    <section className="glass-panel p-6 mb-6 animate-slide-up">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            📞 Sales Calls & Pesanan Masuk
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Tinjau kontrak dan terima pemesanan kargo. Seret kontainer yang diterima ke Bayplan Simulator.
          </p>
        </div>
        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
          {orders.length} Penawaran Tersedia
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[300px] overflow-y-auto pr-1">
        {orders.length === 0 ? (
          <div className="col-span-full py-8 text-center text-slate-400 font-bold text-sm">
            Tidak ada sales calls aktif. Siap berangkat!
          </div>
        ) : (
          orders.map(order => {
            const isCommitted = order.customerType === 'Committed';
            const isReefer = order.containerType === 'REEFER';
            const portName = PORT_NAMES[order.destination];
            
            return (
              <div 
                key={order.id} 
                className={`rounded-xl p-4 transition-all duration-300 border flex flex-col justify-between ${
                  order.accepted 
                    ? 'bg-slate-50 border-slate-200/50 opacity-60' 
                    : isCommitted 
                      ? 'bg-rose-50/50 border-rose-250 hover:border-rose-450 hover:shadow-md'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
                }`}
              >
                {/* Header: Customer name and contract badge */}
                <div className="flex justify-between items-start gap-2 mb-2.5">
                  <div>
                    <h4 className="text-xs font-black text-slate-800 line-clamp-1">
                      {order.customerName}
                    </h4>
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mt-0.5">
                      Ref: {order.id.split('_').slice(-2).join('-')}
                    </span>
                  </div>
                  
                  {isCommitted ? (
                    <span className="text-[9px] font-black tracking-wider px-2 py-0.5 rounded bg-spil-red text-white shadow-sm">
                      COMMITTED
                    </span>
                  ) : (
                    <span className="text-[9px] font-black tracking-wider px-2 py-0.5 rounded bg-sky-100 border border-sky-300 text-sky-850 shadow-sm">
                      REGULAR
                    </span>
                  )}
                </div>

                {/* Logistics details */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50/90 p-2.5 rounded-lg border border-slate-250 mb-3">
                  <div>
                    <span className="text-[9px] text-slate-500 font-extrabold block uppercase tracking-wider">
                      Tipe Kargo
                    </span>
                    <span className={`font-black text-xs ${isReefer ? 'text-sky-700' : 'text-amber-700'}`}>
                      {order.containerType} ({order.quantity}x)
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 font-extrabold block uppercase tracking-wider">
                      Tujuan
                    </span>
                    <span className="font-black text-slate-700">
                      {order.destination} ({portName})
                    </span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-slate-250 flex justify-between items-center">
                    <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider">
                      Tarif / Unit
                    </span>
                    <span className="font-black text-emerald-700 text-sm">
                      {formatRupiah(order.tariff)}
                    </span>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-2 items-center mt-1">
                  {order.accepted ? (
                    <div className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-250 text-emerald-800 text-xs font-black shadow-inner select-none">
                      <CheckCircle className="w-4 h-4 text-emerald-600" /> Dipesan (Siap dimuat)
                    </div>
                  ) : (
                    <>
                      {/* Accept Button */}
                      <button
                        onClick={() => onAccept(order.id)}
                        className={`flex-1 py-1.5 text-xs font-extrabold rounded-lg shadow-sm border transition-all duration-200 uppercase tracking-wider text-white hover:scale-[1.02] active:scale-95 ${
                          isCommitted
                            ? 'bg-spil-red hover:bg-spil-red-hover border-spil-red'
                            : 'bg-spil-green hover:bg-spil-green-hover border-spil-green'
                        }`}
                      >
                        Terima Kargo
                      </button>
                      
                      {/* Decline Button (Only for Non-Committed) */}
                      {!isCommitted ? (
                        <button
                          onClick={() => onDecline(order.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-500 hover:text-rose-600 transition-all duration-200"
                          title="Tolak Penawaran Kargo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <div 
                          className="px-2 py-1 bg-rose-50 border border-rose-100 text-spil-red rounded-lg flex items-center justify-center"
                          title="Kontrak wajib! Melewati ini akan memicu denda."
                        >
                          <AlertCircle className="w-4.5 h-4.5" />
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Denda Penalty Guide */}
                {!order.accepted && (
                  <div className="mt-2.5 text-[9px] text-slate-500 font-bold border-t border-slate-200 pt-1.5 flex justify-between uppercase select-none">
                    <span>Denda Terlewat:</span>
                    <span className="text-spil-red font-black">
                      {isCommitted 
                        ? (isReefer ? 'Rp 24M' : 'Rp 16M')
                        : (isReefer ? 'Rp 16M (jika diterima)' : 'Rp 8M (jika diterima)')}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
