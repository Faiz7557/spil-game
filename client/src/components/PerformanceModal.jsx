import React from 'react';
import { formatRupiah, PORT_NAMES } from '../utils/gameHelpers';
import { Award, Compass, AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';

export default function PerformanceModal({ isOpen, evaluation, history, onClose }) {
  if (!isOpen || !evaluation) return null;
  
  const isProfit = evaluation.netIncome >= 0;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      {/* Modal Card Overhaul - SPIL Light Theme */}
      <div className="w-full max-w-4xl bg-white border border-slate-200/80 shadow-2xl rounded-3xl p-6 md:p-8 flex flex-col gap-6 max-h-[90vh] overflow-y-auto animate-slide-up">
        
        {/* Modal Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-100 pb-4 gap-2">
          <div>
            <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest bg-slate-100 border border-slate-250 px-3 py-1 rounded-full">
              📜 Lembar Kinerja Mingguan
            </span>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-wide mt-2">
              Audit Operasional Mingguan - Pelabuhan {evaluation.port} ({PORT_NAMES[evaluation.port]})
            </h2>
          </div>
          
          <div className="text-left md:text-right">
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
              Periode Waktu
            </span>
            <span className="text-sm font-extrabold text-indigo-650">
              Minggu {evaluation.week} Selesai
            </span>
          </div>
        </div>

        {/* Financial Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Gross Revenue */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col justify-center">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
              Pendapatan Kotor Mingguan
            </span>
            <span className="text-lg font-black text-emerald-600">
              +{formatRupiah(evaluation.grossRevenue)}
            </span>
          </div>

          {/* Shifting & Rolling Penalties */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col justify-center">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
              Denda Operasional
            </span>
            <span className={`text-lg font-black ${evaluation.rollingPenalty + evaluation.restowPenalty > 0 ? 'text-spil-red' : 'text-slate-450'}`}>
              -{formatRupiah(evaluation.rollingPenalty + evaluation.restowPenalty)}
            </span>
          </div>

          {/* Net Weekly Income */}
          <div className={`p-4 rounded-xl flex flex-col justify-center border ${
            isProfit 
              ? 'bg-spil-green-light/30 border-spil-green/20 text-spil-green' 
              : 'bg-spil-red-light/30 border-spil-red/20 text-spil-red'
          }`}>
            <span className="text-[10px] text-slate-655 font-bold uppercase tracking-wider block mb-1">
              Keuntungan/Kerugian Bersih Mingguan
            </span>
            <span className="text-lg font-black">
              {isProfit ? '+' : ''}{formatRupiah(evaluation.netIncome)}
            </span>
          </div>
        </div>

        {/* Detailed Audit Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1. Rolled Cargo Details */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-3 flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <AlertTriangle className="w-4 h-4 text-spil-red" />
              Audit Kargo Rolled & Terabaikan ({evaluation.rolledCount})
            </h3>
            
            {evaluation.rolledDetails && evaluation.rolledDetails.length > 0 ? (
              <div className="space-y-2.5 max-h-[140px] overflow-y-auto pr-1">
                {evaluation.rolledDetails.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs p-2.5 rounded bg-white border border-slate-200">
                    <div>
                      <span className="font-extrabold text-slate-800 block">
                        {item.customerName}
                      </span>
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wide block mt-0.5">
                        {item.customerType} | {item.containerType} (tersisa {item.missingCount}x)
                      </span>
                    </div>
                    <span className="text-spil-red font-black">
                      -{formatRupiah(item.totalPenalty)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-slate-400 text-xs font-bold flex flex-col items-center justify-center gap-1.5">
                <ShieldCheck className="w-5 h-5 text-spil-green" />
                Tidak ada kontainer tertinggal! Bebas denda rolling.
              </div>
            )}
          </div>

          {/* 2. Shifting & Restow Details */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-3 flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <Compass className="w-4 h-4 text-spil-green" />
              Audit Shifting & Restowage ({evaluation.restowCount} Blocker)
            </h3>
            
            {evaluation.restowDetails && evaluation.restowDetails.length > 0 ? (
              <div className="space-y-2.5 max-h-[140px] overflow-y-auto pr-1">
                {evaluation.restowDetails.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs p-2.5 rounded bg-white border border-slate-200">
                    <div>
                      <span className="font-extrabold text-slate-800 uppercase">
                        Kapal Bay {item.bay}, Row {item.row}, Tier {item.tier}
                      </span>
                      <span className="text-[9px] text-slate-400 font-semibold uppercase block mt-0.5">
                        Kargo Later Port menghalangi pembongkaran hold next port langsung
                      </span>
                    </div>
                    <span className="text-spil-red font-black">
                      -Rp 6.000.000
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-slate-400 text-xs font-bold flex flex-col items-center justify-center gap-1.5">
                <ShieldCheck className="w-5 h-5 text-spil-green" />
                Urutan stowage sempurna! Bebas gerakan restow.
              </div>
            )}
          </div>
        </div>

        {/* Ledger History table */}
        {history && history.length > 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-3 border-b border-slate-200 pb-2">
              📈 Riwayat Buku Besar Pelabuhan
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="text-slate-400 font-bold border-b border-slate-200 pb-2 uppercase select-none">
                    <th className="py-2">Minggu</th>
                    <th>Pelabuhan</th>
                    <th>Unit Rolled</th>
                    <th>Denda Rolling</th>
                    <th>Restow</th>
                    <th>Denda Restow</th>
                    <th>Pendapatan Kotor</th>
                    <th className="text-right">Pendapatan Bersih</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map((log, idx) => (
                    <tr key={idx} className="text-slate-600 font-bold">
                      <td className="py-2.5 text-slate-500">Minggu {log.week}</td>
                      <td className="uppercase text-slate-700 font-black">{log.port}</td>
                      <td>{log.rolledCount}x</td>
                      <td className="text-spil-red">{log.rollingPenalty > 0 ? formatRupiah(log.rollingPenalty) : 'Rp 0'}</td>
                      <td>{log.restowCount}x</td>
                      <td className="text-spil-red">{log.restowPenalty > 0 ? formatRupiah(log.restowPenalty) : 'Rp 0'}</td>
                      <td className="text-emerald-600">+{formatRupiah(log.grossRevenue)}</td>
                      <td className={`text-right font-black ${log.netIncome >= 0 ? 'text-spil-green' : 'text-spil-red'}`}>
                        {log.netIncome >= 0 ? '+' : ''}{formatRupiah(log.netIncome)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Next Port CTA button */}
        <div className="mt-2 flex justify-end border-t border-slate-100 pt-4">
          <button
            onClick={onClose}
            className="flex items-center gap-2 bg-spil-green hover:bg-spil-green-hover text-white font-extrabold text-sm px-6 py-3 rounded-xl uppercase tracking-wider shadow-md hover:scale-[1.02] active:scale-95 transition-all"
          >
            Berlayar ke Tujuan Berikutnya
            <ArrowRight className="w-4 h-4 animate-bounce-horizontal" />
          </button>
        </div>
      </div>
    </div>
  );
}
