import React from 'react';
import { formatRupiah } from '../utils/gameHelpers';
import { Ship, Award, RefreshCw, AlertOctagon, Trophy, ShieldAlert, FileSpreadsheet } from 'lucide-react';

export default function GameOverModal({ isOpen, cash, accumulatedPenalties, playerRating, history, onRestart }) {
  if (!isOpen) return null;
  
  const isBankrupt = cash < 0;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 overflow-y-auto">
      {/* Game Over Container - SPIL Light Theme */}
      <div className="w-full max-w-4xl bg-white border border-slate-200 shadow-2xl rounded-3xl p-6 md:p-8 flex flex-col gap-6 max-h-[90vh] overflow-y-auto animate-slide-up">
        
        {/* Header Ribbon */}
        <div className="text-center flex flex-col items-center gap-3 border-b border-slate-100 pb-5">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center border shadow-md ${
            isBankrupt 
              ? 'bg-rose-50 border-rose-200 text-spil-red' 
              : 'bg-amber-50 border-amber-200 text-amber-500 animate-bounce'
          }`}>
            {isBankrupt ? <AlertOctagon className="w-8 h-8" /> : <Trophy className="w-8 h-8" />}
          </div>
          
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
              {isBankrupt ? 'Pelayaran Dihentikan! Bangkrut' : 'Siklus Pelayaran 8-Minggu Selesai!'}
            </h1>
            <p className="text-xs text-slate-500 font-extrabold uppercase mt-1 tracking-wider">
              Laporan Audit Resmi Stowage & Logistik
            </p>
          </div>
        </div>

        {/* Player Rank & Rating Badge */}
        <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-spil-green/10 border border-spil-green/20 flex items-center justify-center text-spil-green">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                Penilaian Rating Perwira Stowage
              </span>
              <span className="text-base font-black text-slate-800 uppercase tracking-wide">
                {playerRating || 'Stowage Inspector'}
              </span>
            </div>
          </div>
          
          <div className="text-right">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
              Penilaian Auditor
            </span>
            <span className={`text-[10px] font-black uppercase px-3 py-1 rounded border ${
              isBankrupt 
                ? 'bg-rose-50 text-spil-red border-rose-200' 
                : 'bg-emerald-50 text-spil-green border-emerald-250'
            }`}>
              {isBankrupt ? 'Kegagalan Operasional' : 'Operator Disetujui'}
            </span>
          </div>
        </div>

        {/* Final Financial Breakdown Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Final Cash Reserves */}
          <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl flex justify-between items-center">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                Saldo Modal Akhir
              </span>
              <span className={`text-2xl font-black ${isBankrupt ? 'text-spil-red' : 'text-spil-green'}`}>
                {formatRupiah(cash)}
              </span>
            </div>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
              isBankrupt ? 'bg-rose-50 border-rose-200 text-spil-red' : 'bg-emerald-50 border-emerald-250 text-spil-green'
            }`}>
              <Ship className="w-5 h-5" />
            </div>
          </div>

          {/* Cumulative Shifting Penalties */}
          <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl flex justify-between items-center">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                Total Denda Pelayaran
              </span>
              <span className="text-2xl font-black text-spil-red">
                {formatRupiah(accumulatedPenalties)}
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-spil-red">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Historical Ledger Report */}
        {history && history.length > 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-3 flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <FileSpreadsheet className="w-4 h-4 text-spil-green" />
              Riwayat Lengkap Buku Besar Pelayaran 8-Minggu
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="text-slate-400 font-bold border-b border-slate-200 pb-2 uppercase select-none">
                    <th className="py-2">Minggu</th>
                    <th>Pelabuhan</th>
                    <th>Unit Rolled</th>
                    <th>Denda Rolling</th>
                    <th>Blocker Restow</th>
                    <th>Denda Restow</th>
                    <th>Pendapatan Kotor</th>
                    <th className="text-right">Pendapatan Bersih</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map((log, idx) => (
                    <tr key={idx} className="text-slate-600 font-bold">
                      <td className="py-2.5 text-slate-500 font-extrabold">Minggu {log.week}</td>
                      <td className="uppercase text-slate-750 font-black">{log.port}</td>
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

        {/* Restart Action */}
        <div className="mt-2 flex justify-center border-t border-slate-100 pt-5">
          <button
            onClick={onRestart}
            className="flex items-center justify-center gap-2 bg-spil-green hover:bg-spil-green-hover text-white font-extrabold text-sm px-8 py-3.5 rounded-xl uppercase tracking-wider shadow-md hover:scale-[1.02] active:scale-95 transition-all"
          >
            <RefreshCw className="w-4 h-4 animate-spin-slow" />
            Mulai Pelayaran Baru (Main Lagi)
          </button>
        </div>
      </div>
    </div>
  );
}
