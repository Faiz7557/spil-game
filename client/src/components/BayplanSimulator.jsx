import React, { useState } from 'react';
import { BAYS, getBayConfig } from '../utils/gameHelpers';
import { formatRupiah, PORT_NAMES, PORT_COLORS, getNextPort } from '../utils/gameHelpers';
import { Ship, Info, ArrowDown, ShieldAlert, Sparkles, XCircle } from 'lucide-react';

export default function BayplanSimulator({ 
  grid, 
  currentPort, 
  pendingContainers, 
  onPlaceContainer, 
  onRemoveContainer 
}) {
  const [selectedPendingId, setSelectedPendingId] = useState(null);
  const nextPort = getNextPort(currentPort);

  // Local helper to determine if a container is a restow blocker in real-time
  const checkIsRestowBlocker = (bay, row, tier, container) => {
    if (!container || container.destination === nextPort) return false;
    
    const stack = grid[bay][row];
    const tiers = getBayConfig(bay).tiers; // bottom to top
    const currentTierIdx = tiers.indexOf(tier);
    
    // Check if there is ANY next-port container below this container in the stack
    for (let i = 0; i < currentTierIdx; i++) {
      const lowerContainer = stack[tiers[i]];
      if (lowerContainer && lowerContainer.destination === nextPort) {
        return true;
      }
    }
    return false;
  };

  // Drag and Drop handlers
  const handleDragStart = (e, containerId) => {
    e.dataTransfer.setData('text/plain', containerId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, bay, row, tier) => {
    e.preventDefault();
    const containerId = e.dataTransfer.getData('text/plain');
    if (containerId) {
      onPlaceContainer(containerId, bay, row, tier);
    }
  };

  // Click-to-place fallback handlers
  const handlePendingClick = (id) => {
    setSelectedPendingId(selectedPendingId === id ? null : id);
  };

  const handleSlotClick = (bay, row, tier) => {
    const containerInSlot = grid[bay][row][tier];
    
    if (containerInSlot) {
      // Slot occupied: Remove container and return to pending
      onRemoveContainer(bay, row, tier);
      setSelectedPendingId(null);
    } else if (selectedPendingId) {
      // Slot empty and container selected: Place container
      onPlaceContainer(selectedPendingId, bay, row, tier);
      setSelectedPendingId(null);
    }
  };

  // Find container in pending list
  const activeSelectedContainer = pendingContainers.find(c => c.id === selectedPendingId);

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-4 gap-6 animate-slide-up">
      {/* 1. Pending Containers Sidebar Shelf */}
      <div className="lg:col-span-1 glass-panel p-4 flex flex-col h-[580px] bg-white border border-slate-200">
        <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="font-extrabold text-slate-800 flex items-center gap-1.5 text-xs uppercase tracking-wider">
            📦 Pending Shelf ({pendingContainers.length})
          </h3>
          {selectedPendingId && (
            <button 
              onClick={() => setSelectedPendingId(null)}
              className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-2 py-0.5 rounded border border-slate-300"
            >
              Bersihkan
            </button>
          )}
        </div>
        
        <p className="text-[11px] text-slate-500 font-medium mb-3 leading-relaxed">
          Pilih kontainer dan klik slot kosong pada kapal, atau seret kontainer secara langsung.
        </p>
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
          {pendingContainers.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs py-10 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/50">
              <Sparkles className="w-6 h-6 mb-2 text-slate-400" />
              Shelf kosong.
              <span className="text-[10px] text-slate-500 mt-1 block font-semibold">
                Terima panggilan sales lebih banyak.
              </span>
            </div>
          ) : (
            pendingContainers.map(container => {
              const isSelected = selectedPendingId === container.id;
              const isReefer = container.containerType === 'REEFER';
              
              return (
                <div
                  key={container.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, container.id)}
                  onClick={() => handlePendingClick(container.id)}
                  className={`cursor-pointer rounded-xl p-3 border transition-all duration-200 select-none ${
                    isSelected 
                      ? 'bg-spil-green-light/60 border-spil-green shadow-sm scale-[0.98]'
                      : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded ${
                      isReefer 
                        ? 'bg-sky-100 text-sky-700 border border-sky-300' 
                        : 'bg-amber-100 text-amber-700 border border-amber-300'
                    }`}>
                      {container.containerType}
                    </span>
                    <span className="text-[9px] text-slate-500 font-bold uppercase">
                      ID: {container.id.split('_').slice(-2).join('-')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-end mt-2">
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase font-bold">
                        Tujuan
                      </span>
                      <span className="text-xs font-black text-slate-700 uppercase">
                        {container.destination} ({PORT_NAMES[container.destination]})
                      </span>
                    </div>
                    
                    <div className="text-right">
                      <span className="text-[9px] text-slate-500 block uppercase font-bold">
                        Pendapatan Freight
                      </span>
                      <span className="text-xs font-black text-emerald-700">
                        {formatRupiah(container.tariff)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-[9px] text-slate-500 border-t border-slate-200 pt-1 flex justify-between uppercase">
                    <span className="truncate max-w-[100px] font-semibold">{container.customerName}</span>
                    <span className={container.customerType === 'Committed' ? 'text-spil-red font-black' : 'font-bold'}>
                      {container.customerType}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        {/* Selected cargo slot details preview */}
        {activeSelectedContainer && (
          <div className="mt-3 bg-spil-green-light border border-spil-green/30 p-2.5 rounded-xl text-xs">
            <span className="text-[10px] text-spil-green font-black uppercase tracking-wider block mb-1">
              Mode Penempatan Aktif
            </span>
            <div className="text-slate-700 font-bold leading-relaxed">
              Tempatkan {activeSelectedContainer.containerType} tujuan{' '}
              <strong className="text-slate-900 uppercase">{activeSelectedContainer.destination}</strong> di slot{' '}
              <strong className="text-slate-900 font-black">{activeSelectedContainer.containerType === 'REEFER' ? 'REEFER (Bay 14/10)' : 'DRY (Bay 18/06/02)'}</strong> manapun.
            </div>
          </div>
        )}
      </div>

      {/* 2. Vessel Bayplan Simulator Canvas */}
      <div className="lg:col-span-3 flex flex-col gap-6 overflow-x-auto">
        <div className="flex justify-between items-center gap-4 bg-white border border-slate-250 p-3.5 rounded-xl">
          <div className="flex items-center gap-2 text-slate-700 text-xs font-black">
            <Ship className="w-4 h-4 text-spil-green" />
            <span>Status Kapasitas Kapal: 54 slot kontainer</span>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-extrabold text-slate-500">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500/25 border border-emerald-450"></span> SBY
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-blue-500/25 border border-blue-450"></span> MKS
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-purple-500/25 border border-purple-450"></span> JYP
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-orange-500/25 border border-orange-450"></span> MDN
            </div>
          </div>
        </div>

        {/* Scrollable container grid workspace */}
        <div className="flex flex-col gap-8 pb-4 min-w-[700px]">
          {BAYS.map(bay => {
            const config = getBayConfig(bay);
            const isBay18 = bay === '18';
            const isReeferBay = config.containerType === 'REEFER';
            
            return (
              <div 
                key={bay} 
                className="glass-panel p-5 bg-white border-t-4 border-slate-350 shadow-md"
              >
                {/* Bay Header */}
                <div className="flex justify-between items-center mb-4 border-b border-slate-200 pb-2">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                      ⚓ BAY {bay}
                    </h4>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block mt-0.5">
                      Tipe: {config.containerType} | Tiers:{' '}
                      {config.tiers.join(', ')} | Rows: {config.rows.join(', ')}
                    </span>
                  </div>
                  
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                    isReeferBay 
                      ? 'bg-sky-50 text-sky-700 border-sky-300 shadow-sm' 
                      : 'bg-amber-50 text-amber-700 border-amber-300 shadow-sm'
                  }`}>
                    {isReeferBay ? 'SLOT REEFER PLUG' : 'SLOT KARGO DRY'}
                  </span>
                </div>

                {/* Stacking Grid Rows */}
                <div className="flex flex-col gap-1 w-full">
                  {/* Rows headers */}
                  <div className="grid grid-cols-5 text-center text-[10px] font-extrabold text-slate-500 mb-1">
                    <div>Row</div>
                    {config.rows.map(row => (
                      <div key={row} className="uppercase font-extrabold text-slate-650">
                        {row === '00' ? '00 (Center)' : `Row ${row}`}
                      </div>
                    ))}
                  </div>

                  {/* Render tiers from top to bottom (84 down to 02) */}
                  {config.tiers.map(tier => {
                    const isUnderdeck = tier === '02';
                    
                    return (
                      <React.Fragment key={tier}>
                        {/* Styled visual Hatch Cover Divider above Tier 02 */}
                        {isUnderdeck && (
                          <div className="col-span-5 flex items-center gap-2 my-2 py-0.5 px-2 bg-slate-200 rounded border border-slate-350 shadow-inner">
                            <span className="text-[9px] font-black tracking-wider text-slate-700 uppercase select-none flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                              HATCH COVER DECK PLATE
                            </span>
                            <div className="flex-1 h-[2px] bg-slate-350"></div>
                            <ArrowDown className="w-3 h-3 text-slate-600 animate-bounce" />
                            <span className="text-[9px] font-black text-slate-700 tracking-wider select-none uppercase">
                              UNDERDECK HOLD HOLDING
                            </span>
                          </div>
                        )}

                        <div className="grid grid-cols-5 items-center gap-2.5 h-16">
                          {/* Left Column: Tier label */}
                          <div className="flex flex-col justify-center items-center h-full bg-slate-100 border border-slate-250 rounded-lg select-none">
                            <span className="text-[10px] text-slate-600 font-extrabold block uppercase tracking-wider">
                              Tier {tier}
                            </span>
                            <span className="text-[9px] text-slate-500 font-bold block uppercase">
                              {isUnderdeck ? 'Hold' : 'Deck'}
                            </span>
                          </div>

                          {/* Data columns */}
                          {config.rows.map(row => {
                            const container = grid[bay][row][tier];
                            const isRestowed = checkIsRestowBlocker(bay, row, tier, container);
                            
                            // Color mapping based on destination (High-contrast soft pastels with bold borders)
                            let bgClass = 'bg-slate-50 hover:bg-slate-100/90 border-slate-250 border-dashed hover:border-slate-350 text-slate-500';
                            let textClass = 'text-slate-500';
                            let borderClass = 'border-slate-250';
                            
                            if (container) {
                              const dest = container.destination;
                              if (dest === 'SBY') {
                                bgClass = 'bg-emerald-100 hover:bg-emerald-150 text-emerald-950 font-black';
                                textClass = 'text-emerald-900';
                                borderClass = 'border-emerald-400 shadow-sm';
                              } else if (dest === 'MKS') {
                                bgClass = 'bg-sky-100 hover:bg-sky-150 text-sky-950 font-black';
                                textClass = 'text-sky-900';
                                borderClass = 'border-sky-400 shadow-sm';
                              } else if (dest === 'JYP') {
                                bgClass = 'bg-purple-100 hover:bg-purple-150 text-purple-950 font-black';
                                textClass = 'text-purple-900';
                                borderClass = 'border-purple-400 shadow-sm';
                              } else if (dest === 'MDN') {
                                bgClass = 'bg-amber-100 hover:bg-amber-150 text-amber-950 font-black';
                                textClass = 'text-amber-900';
                                borderClass = 'border-amber-400 shadow-sm';
                              }
                            }

                            const isTargetSelectedSlot = selectedPendingId && !container;
                            
                            return (
                              <div
                                key={row}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, bay, row, tier)}
                                onClick={() => handleSlotClick(bay, row, tier)}
                                className={`relative h-full rounded-xl border flex flex-col justify-center items-center cursor-pointer transition-all duration-200 select-none ${bgClass} ${borderClass} ${
                                  isTargetSelectedSlot 
                                    ? 'border-dashed border-spil-green bg-spil-green-light animate-pulse'
                                    : ''
                                } ${
                                  isRestowed 
                                    ? 'border-spil-red border-2 shadow-md animate-border-pulse' 
                                    : ''
                                }`}
                              >
                                {container ? (
                                  <>
                                    {/* Slot Container Details */}
                                    <div className="absolute top-1 left-1.5 text-[8px] font-black uppercase text-slate-550 flex items-center gap-1 select-none">
                                      {container.containerType}
                                    </div>
                                    
                                    {/* Action overlays on hover */}
                                    <div className="absolute top-1 right-1.5 opacity-0 hover:opacity-100 transition-opacity">
                                      <XCircle className="w-3.5 h-3.5 text-spil-red" />
                                    </div>
                                    
                                    <span className={`text-sm font-black tracking-widest ${textClass}`}>
                                      {container.destination}
                                    </span>
                                    
                                    <span className="text-[8px] font-black text-slate-800 mt-0.5 leading-none">
                                      Rev: {formatRupiah(container.tariff).split('.')[0]}M
                                    </span>

                                    {/* Stripes patterns */}
                                    <div className={`absolute inset-0 rounded-xl pointer-events-none opacity-40 ${
                                      container.containerType === 'REEFER' ? 'reefer-pattern' : 'dry-pattern'
                                    }`}></div>

                                    {/* Floating warning icon for restowed container */}
                                    {isRestowed && (
                                      <div 
                                        className="absolute -top-1.5 -right-1.5 bg-spil-red border border-white shadow-md rounded-full p-0.5 text-white animate-bounce"
                                        title={`Restow Blocker! Menghalangi bongkar muat hold ${nextPort} di pelabuhan berikutnya. Denda shifting Rp 3.000.000 / gerakan.`}
                                      >
                                        <ShieldAlert className="w-3 h-3" />
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  /* Empty slot placeholder */
                                  <span className="text-[9px] text-slate-500 font-extrabold opacity-60 select-none tracking-wider">
                                    Kosong
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
