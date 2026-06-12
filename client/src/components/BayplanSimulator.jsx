import React, { useState } from 'react';
import { BAYS, getBayConfig } from '../utils/gameHelpers';
import { formatRupiah, PORT_NAMES, PORT_COLORS, getNextPort } from '../utils/gameHelpers';
import { Ship, Info, ArrowDown, ShieldAlert, Sparkles, XCircle, Anchor } from 'lucide-react';

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
      <div className="lg:col-span-1 glass-panel p-5 flex flex-col h-[600px] bg-white border border-slate-200/90 shadow-sm">
        <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h3 className="font-extrabold text-slate-800 flex items-center gap-1.5 text-xs uppercase tracking-wider">
            📦 Pending Shelf ({pendingContainers.length})
          </h3>
          {selectedPendingId && (
            <button 
              onClick={() => setSelectedPendingId(null)}
              className="text-[9px] bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold px-2 py-0.5 rounded-md border border-slate-350"
            >
              CLEAR
            </button>
          )}
        </div>
        
        <p className="text-[10px] text-slate-400 font-bold mb-3 leading-relaxed uppercase tracking-wider">
          Pilih kontainer lalu klik slot kosong pada kapal, atau seret kontainer langsung ke slot bay.
        </p>

        {/* Shelf scroll box */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
          {pendingContainers.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs py-16 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <Sparkles className="w-8 h-8 mb-2 text-slate-300" />
              Shelf Kosong.
              <span className="text-[9px] text-slate-400 mt-1 block uppercase font-black">
                Klaim kontrak kargo di pasar.
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
                  className={`cursor-pointer rounded-xl p-3 border transition-all duration-200 select-none relative overflow-hidden ${
                    isSelected 
                      ? 'bg-emerald-50/70 border-spil-green shadow-sm scale-[0.98]'
                      : 'bg-white hover:bg-slate-50 border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-slate-200"></div>

                  <div className="flex justify-between items-center mb-1 pl-1">
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${
                      isReefer 
                        ? 'bg-sky-50 text-sky-700 border border-sky-200' 
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {container.containerType}
                    </span>
                    <span className="text-[8px] text-slate-400 font-bold uppercase">
                      ID: {container.id.split('_').slice(-2).join('-')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-end mt-2.5 pl-1">
                    <div>
                      <span className="text-[8px] text-slate-400 block uppercase font-black select-none">
                        Tujuan
                      </span>
                      <span className="text-xs font-black text-slate-700 uppercase">
                        {container.destination}
                      </span>
                    </div>
                    
                    <div className="text-right">
                      <span className="text-[8px] text-slate-400 block uppercase font-black select-none">
                        Pendapatan
                      </span>
                      <span className="text-xs font-extrabold text-emerald-700">
                        {formatRupiah(container.tariff)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-[8px] text-slate-400 border-t border-slate-100 pt-1.5 flex justify-between uppercase pl-1">
                    <span className="truncate max-w-[95px] font-bold">{container.customerName}</span>
                    <span className={container.customerType === 'Committed' ? 'text-spil-red font-black' : 'font-extrabold'}>
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
          <div className="mt-3 bg-emerald-50 border border-emerald-150 p-3 rounded-xl text-xs flex gap-2 items-start shadow-inner">
            <Info className="w-4 h-4 text-spil-green shrink-0 mt-0.5" />
            <div className="text-slate-600 font-semibold leading-relaxed">
              <span className="text-[9px] text-spil-green font-black uppercase tracking-wider block mb-0.5">
                Kargo Terpilih
              </span>
              Tempatkan {activeSelectedContainer.containerType} tujuan <strong className="text-slate-800 uppercase">{activeSelectedContainer.destination}</strong> pada slot <strong className="text-slate-800 font-black">{activeSelectedContainer.containerType === 'REEFER' ? 'REEFER (Bay 14/10)' : 'DRY (Bay 18/06/02)'}</strong>.
            </div>
          </div>
        )}
      </div>

      {/* 2. Vessel Bayplan Simulator Canvas */}
      <div className="lg:col-span-3 flex flex-col gap-6 overflow-x-auto">
        {/* Vessel Capacity Status Header */}
        <div className="flex justify-between items-center gap-4 bg-white border border-slate-200/90 p-3.5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 text-slate-700 text-xs font-black">
            <Ship className="w-4 h-4 text-spil-green" />
            <span>Kapasitas Kapal: 54 Slot Stowage</span>
          </div>
          <div className="flex items-center gap-4 text-[9px] font-black text-slate-400 select-none">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500/20 border border-emerald-400 shadow-sm"></span> SBY
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-blue-500/20 border border-blue-400 shadow-sm"></span> MKS
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-purple-500/20 border border-purple-400 shadow-sm"></span> JYP
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-orange-500/20 border border-orange-400 shadow-sm"></span> MDN
            </div>
          </div>
        </div>

        {/* Scrollable container grid workspace */}
        <div className="flex flex-col gap-8 pb-4 min-w-[720px]">
          {BAYS.map(bay => {
            const config = getBayConfig(bay);
            const isReeferBay = config.containerType === 'REEFER';
            
            return (
              <div 
                key={bay} 
                className="glass-panel p-5 bg-white border-t-4 border-t-slate-400 shadow-sm"
              >
                {/* Bay Header */}
                <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Anchor className="w-4 h-4 text-slate-400" />
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-800 tracking-wider">
                        BAY {bay}
                      </h4>
                      <span className="text-[8px] text-slate-400 font-bold uppercase block mt-0.5">
                        Tipe: {config.containerType} | Rows: {config.rows.join(', ')} | Tiers: {config.tiers.join(', ')}
                      </span>
                    </div>
                  </div>
                  
                  <span className={`text-[8.5px] font-black px-2.5 py-1 rounded-md border ${
                    isReeferBay 
                      ? 'bg-sky-50 text-sky-700 border-sky-200 shadow-sm' 
                      : 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm'
                  }`}>
                    {isReeferBay ? 'REEFER PLUG SLOTS' : 'DRY SLOTS'}
                  </span>
                </div>

                {/* Stacking Grid Rows */}
                <div className="flex flex-col gap-1.5 w-full">
                  {/* Rows headers */}
                  <div className="grid grid-cols-5 text-center text-[9px] font-black text-slate-400 mb-1.5 uppercase select-none tracking-widest">
                    <div></div>
                    {config.rows.map(row => (
                      <div key={row} className="font-black">
                        {row === '00' ? '00 (Center)' : `Row ${row}`}
                      </div>
                    ))}
                  </div>

                  {/* Render tiers from top to bottom */}
                  {config.tiers.map(tier => {
                    const isUnderdeck = tier === '02';
                    
                    return (
                      <React.Fragment key={tier}>
                        {/* Visual Hatch Cover Plate above Tier 02 */}
                        {isUnderdeck && (
                          <div className="col-span-5 flex items-center gap-2.5 my-2.5 py-1 px-3 bg-slate-100 border border-slate-250 rounded-lg shadow-sm">
                            <span className="text-[8px] font-black tracking-widest text-slate-600 uppercase select-none flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                              HATCH COVER DECK PLATE
                            </span>
                            <div className="flex-1 h-[2px] bg-slate-250"></div>
                            <ArrowDown className="w-3.5 h-3.5 text-slate-500 animate-bounce" />
                            <span className="text-[8px] font-black text-slate-600 tracking-widest select-none uppercase">
                              UNDERDECK HOLD
                            </span>
                          </div>
                        )}

                        <div className="grid grid-cols-5 items-center gap-3 h-16">
                          {/* Left Column: Tier label */}
                          <div className="flex flex-col justify-center items-center h-full bg-slate-50 border border-slate-200 rounded-xl select-none">
                            <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider">
                              Tier {tier}
                            </span>
                            <span className="text-[8px] text-slate-400 font-bold block uppercase mt-0.5">
                              {isUnderdeck ? 'Hold' : 'Deck'}
                            </span>
                          </div>

                          {/* Grid slots data columns */}
                          {config.rows.map(row => {
                            const container = grid[bay][row][tier];
                            const isRestowed = checkIsRestowBlocker(bay, row, tier, container);
                            
                            // Style mappings
                            let bgClass = 'bg-slate-50/50 hover:bg-slate-50 border-slate-200 border-dashed hover:border-slate-300 text-slate-400';
                            let textClass = 'text-slate-400';
                            let borderClass = 'border-slate-200/80';
                            
                            if (container) {
                              const dest = container.destination;
                              if (dest === 'SBY') {
                                bgClass = 'bg-emerald-100/70 hover:bg-emerald-100 text-emerald-950 font-black';
                                textClass = 'text-emerald-900';
                                borderClass = 'border-emerald-350 shadow-sm';
                              } else if (dest === 'MKS') {
                                bgClass = 'bg-sky-100/70 hover:bg-sky-100 text-sky-950 font-black';
                                textClass = 'text-sky-900';
                                borderClass = 'border-sky-350 shadow-sm';
                              } else if (dest === 'JYP') {
                                bgClass = 'bg-purple-100/70 hover:bg-purple-100 text-purple-950 font-black';
                                textClass = 'text-purple-900';
                                borderClass = 'border-purple-350 shadow-sm';
                              } else if (dest === 'MDN') {
                                bgClass = 'bg-amber-100/70 hover:bg-amber-100 text-amber-950 font-black';
                                textClass = 'text-amber-900';
                                borderClass = 'border-amber-350 shadow-sm';
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
                                    ? 'border-dashed border-spil-green bg-emerald-50/80 animate-pulse'
                                    : ''
                                } ${
                                  isRestowed 
                                    ? 'border-spil-red border-2 shadow-md animate-border-pulse' 
                                    : ''
                                }`}
                              >
                                {container ? (
                                  <>
                                    {/* Action overlays on hover */}
                                    <div className="absolute top-1 right-1.5 opacity-0 hover:opacity-100 transition-opacity">
                                      <XCircle className="w-3.5 h-3.5 text-spil-red" />
                                    </div>
                                    
                                    <div className="absolute top-1 left-2 text-[7.5px] font-black uppercase text-slate-500 select-none">
                                      {container.containerType}
                                    </div>
                                    
                                    <span className={`text-xs md:text-sm font-black tracking-widest ${textClass}`}>
                                      {container.destination}
                                    </span>
                                    
                                    <span className="text-[7.5px] font-extrabold text-slate-700 mt-0.5 leading-none">
                                      Rev: {formatRupiah(container.tariff).split('.')[0]}M
                                    </span>

                                    {/* Stripe patterns */}
                                    <div className={`absolute inset-0 rounded-xl pointer-events-none opacity-30 ${
                                      container.containerType === 'REEFER' ? 'reefer-pattern' : 'dry-pattern'
                                    }`}></div>

                                    {/* Floating warning icon for restowed container */}
                                    {isRestowed && (
                                      <div 
                                        className="absolute -top-1.5 -right-1.5 bg-spil-red border border-white shadow-md rounded-full p-0.5 text-white animate-bounce"
                                        title={`Restow Blocker! Menghalangi bongkar muat kargo ${nextPort} di pelabuhan berikutnya. Shifting fee Rp 3.000.000 / gerakan.`}
                                      >
                                        <ShieldAlert className="w-3 h-3" />
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  /* Empty slot placeholder */
                                  <span className="text-[9px] text-slate-400 font-extrabold opacity-60 tracking-wider">
                                    KOSONG
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
