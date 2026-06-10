import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import SalesCall from './components/SalesCall';
import BayplanSimulator from './components/BayplanSimulator';
import PerformanceModal from './components/PerformanceModal';
import GameOverModal from './components/GameOverModal';
import { getBayConfig } from './utils/gameHelpers';
import { formatRupiah, PORT_NAMES } from './utils/gameHelpers';
import { AlertCircle, HelpCircle, Anchor, Play, ShieldAlert, Award, Ship } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5050/api';

export default function App() {
  const [session, setSession] = useState(null);
  const [pendingContainers, setPendingContainers] = useState([]);
  const [showWeeklyModal, setShowWeeklyModal] = useState(false);
  const [lastEvaluation, setLastEvaluation] = useState(null);
  const [alertMessage, setAlertMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Initialize or fetch active game on mount
  useEffect(() => {
    handleStartGame();
  }, []);

  const handleStartGame = async () => {
    setLoading(true);
    setAlertMessage(null);
    try {
      const response = await fetch(`${API_BASE_URL}/game/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const resData = await response.json();
      if (resData.success) {
        setSession(resData.data);
        setPendingContainers([]);
        setLastEvaluation(null);
        setShowWeeklyModal(false);
      } else {
        showTemporaryAlert('Gagal menginisialisasi sesi permainan.');
      }
    } catch (error) {
      console.error('Error connecting to backend:', error);
      showTemporaryAlert('Tidak dapat terhubung ke server backend. Pastikan server aktif di port 5050.');
    } finally {
      setLoading(false);
    }
  };

  const showTemporaryAlert = (msg) => {
    setAlertMessage(msg);
    setTimeout(() => {
      setAlertMessage(null);
    }, 6000);
  };

  // Accept a Sales Call Order
  const handleAcceptOrder = async (orderId) => {
    if (!session) return;
    try {
      const response = await fetch(`${API_BASE_URL}/game/accept-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.sessionId, orderId })
      });
      const resData = await response.json();
      if (resData.success) {
        const prevSession = session;
        setSession(resData.data);
        
        // Find the accepted order to generate individual container units for the pending shelf
        const acceptedOrder = resData.data.orders.find(o => o.id === orderId);
        if (acceptedOrder) {
          const newContainers = [];
          for (let q = 0; q < acceptedOrder.quantity; q++) {
            newContainers.push({
              id: `${acceptedOrder.id}_cont_${q}`,
              orderId: acceptedOrder.id,
              containerType: acceptedOrder.containerType,
              origin: acceptedOrder.origin,
              destination: acceptedOrder.destination,
              tariff: acceptedOrder.tariff,
              customerType: acceptedOrder.customerType,
              customerName: acceptedOrder.customerName
            });
          }
          setPendingContainers(prev => [...prev, ...newContainers]);
        }
      } else {
        showTemporaryAlert(resData.message || 'Gagal menerima pesanan.');
      }
    } catch (error) {
      console.error('Error accepting order:', error);
      showTemporaryAlert('Gagal menerima pesanan. Server mungkin sedang offline.');
    }
  };

  // Decline a Non-Committed Order
  const handleDeclineOrder = async (orderId) => {
    if (!session) return;
    try {
      const response = await fetch(`${API_BASE_URL}/game/decline-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.sessionId, orderId })
      });
      const resData = await response.json();
      if (resData.success) {
        setSession(resData.data);
      } else {
        showTemporaryAlert(resData.message || 'Gagal menolak pesanan.');
      }
    } catch (error) {
      console.error('Error declining order:', error);
      showTemporaryAlert('Gagal menolak pesanan.');
    }
  };

  // Local Drag-and-Drop / Click-to-Place validation
  const handlePlaceContainer = (containerId, bay, row, tier) => {
    if (!session) return;
    
    // Find the container in our pending shelf
    const container = pendingContainers.find(c => c.id === containerId);
    if (!container) return;
    
    const bayConfig = getBayConfig(bay);
    const stack = session.grid[bay][row];
    
    // 1. Container type match bay constraint
    if (bayConfig.containerType === 'REEFER' && container.containerType !== 'REEFER') {
      showTemporaryAlert(`Gagal Memuat: Bay ${bay} adalah slot khusus REEFER. Tidak dapat memuat kargo DRY.`);
      return;
    }
    if (bayConfig.containerType === 'DRY' && container.containerType !== 'DRY') {
      showTemporaryAlert(`Gagal Memuat: Bay ${bay} adalah slot khusus DRY. Tidak dapat memuat kargo REEFER.`);
      return;
    }
    
    // 2. Slot empty constraint
    if (stack[tier] !== null) {
      showTemporaryAlert(`Gagal Memuat: Bay ${bay}, Row ${row}, Tier ${tier} sudah terisi.`);
      return;
    }
    
    // 3. Stacking physical support constraint
    if (tier === '84' && stack['82'] === null) {
      showTemporaryAlert(`Pelanggaran Stacking Kapal: Kontainer di Bay ${bay}, Row ${row}, Tier 84 melayang! Anda harus memuat Tier 82 terlebih dahulu.`);
      return;
    }
    
    // If validation passes, commit locally
    const updatedGrid = JSON.parse(JSON.stringify(session.grid));
    updatedGrid[bay][row][tier] = container;
    
    setSession(prev => ({ ...prev, grid: updatedGrid }));
    setPendingContainers(prev => prev.filter(c => c.id !== containerId));
  };

  // Unload container back to pending shelf
  const handleRemoveContainer = (bay, row, tier) => {
    if (!session) return;
    
    const stack = session.grid[bay][row];
    const container = stack[tier];
    
    if (!container) return;
    
    // Stacking validation: cannot remove Tier 82 if Tier 84 is loaded above it
    if (tier === '82' && stack['84'] !== null) {
      showTemporaryAlert(`Pelanggaran Unstacking Kapal: Tidak dapat membongkar Tier 82 ketika Tier 84 menampung kontainer tepat di atasnya.`);
      return;
    }
    
    // Commit removal locally
    const updatedGrid = JSON.parse(JSON.stringify(session.grid));
    updatedGrid[bay][row][tier] = null;
    
    setSession(prev => ({ ...prev, grid: updatedGrid }));
    setPendingContainers(prev => [...prev, container]);
  };

  // Sail to Next Port! Sends grid configuration to backend for validation and transition.
  const handleDepartPort = async () => {
    if (!session || loading) return;
    
    setLoading(true);
    setAlertMessage(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/game/depart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sessionId: session.sessionId, 
          grid: session.grid 
        })
      });
      
      const resData = await response.json();
      
      if (resData.success) {
        // Successful transition
        setSession(resData.data);
        setLastEvaluation(resData.weeklyEvaluation);
        setPendingContainers([]); // Clear pending shelf
        setShowWeeklyModal(true); // Open Weekly Performance Sheet
      } else {
        // Show validation errors from backend
        showTemporaryAlert(resData.message || 'Keberangkatan kapal gagal.');
        if (resData.errors && resData.errors.length > 0) {
          console.error('Validation errors:', resData.errors);
          showTemporaryAlert(`Kesalahan Fisika: ${resData.errors[0]}`);
        }
      }
    } catch (error) {
      console.error('Error departing:', error);
      showTemporaryAlert('Transisi keberangkatan kapal gagal. Periksa status server.');
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-spil-green p-6 animate-slide-up" style={{ backgroundImage: "linear-gradient(to bottom, #1b5334, #2E7D4E, #1b5334)" }}>
        <div className="glass-panel max-w-md w-full p-8 text-center border-slate-200">
          <Ship className="w-16 h-16 text-spil-green mx-auto mb-4 animate-bounce" />
          <h1 className="text-2xl font-black text-slate-800 mb-2">
            SPIL GAME: 4 JALUR
          </h1>
          <p className="text-slate-500 text-sm mb-6 font-semibold">
            Memuat sirkuit logistik pelabuhan. Pastikan server backend Node.js aktif di Port 5050.
          </p>
          <button
            onClick={handleStartGame}
            className="w-full bg-spil-green hover:bg-spil-green-hover text-white font-extrabold py-3.5 px-6 rounded-xl uppercase tracking-wider border-transparent shadow-md hover:scale-[1.02] active:scale-95 transition-all duration-200"
          >
            Hubungkan & Mulai Pelayaran
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 flex flex-col items-center max-w-[1400px] mx-auto">
      {/* 1. Global Alert Banner */}
      {alertMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 animate-bounce">
          <div className="bg-rose-50 border border-rose-200 text-spil-red px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 font-semibold">
            <AlertCircle className="w-5 h-5 text-spil-red shrink-0" />
            <span className="text-xs font-bold leading-relaxed">{alertMessage}</span>
          </div>
        </div>
      )}

      {/* 2. Top Dashboard Banner */}
      <Dashboard 
        week={session.week}
        currentPort={session.currentPort}
        cash={session.cash}
        accumulatedPenalties={session.accumulatedPenalties}
      />

      {/* 3. Sales Call Panel */}
      <SalesCall 
        orders={session.orders || []}
        onAccept={handleAcceptOrder}
        onDecline={handleDeclineOrder}
      />

      {/* 4. Main Simulator workspace grid */}
      <div className="w-full flex-1">
        <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              🚢 Grid Stowage Bayplan Interaktif
            </h2>
            <p className="text-xs text-emerald-100/90 font-bold mt-0.5">
              Konfigurasikan tata letak kontainer. Pastikan kontainer tujuan Later Port tidak menghalangi kontainer tujuan Next Port dalam satu stack.
            </p>
          </div>
          
          <button
            onClick={handleDepartPort}
            disabled={loading || session.isGameOver}
            className="flex items-center gap-2 bg-spil-green hover:bg-spil-green-hover disabled:opacity-50 text-white border-transparent font-extrabold text-xs px-6 py-2.5 rounded-xl uppercase tracking-wider shadow-md hover:scale-[1.02] active:scale-95 transition-all w-full sm:w-auto justify-center"
          >
            <Play className="w-4 h-4 fill-white" />
            {loading ? 'Validasi Stowage...' : 'Berangkat dari Pelabuhan (Sailing)'}
          </button>
        </div>

        <BayplanSimulator 
          grid={session.grid}
          currentPort={session.currentPort}
          pendingContainers={pendingContainers}
          onPlaceContainer={handlePlaceContainer}
          onRemoveContainer={handleRemoveContainer}
        />
      </div>

      {/* 5. Lembar Kinerja Mingguan modal popup */}
      <PerformanceModal 
        isOpen={showWeeklyModal}
        evaluation={lastEvaluation}
        history={session.performanceLog}
        onClose={() => setShowWeeklyModal(false)}
      />

      {/* 6. Game Over Modal */}
      <GameOverModal 
        isOpen={session.isGameOver}
        cash={session.cash}
        accumulatedPenalties={session.accumulatedPenalties}
        playerRating={session.playerRating}
        history={session.performanceLog}
        onRestart={handleStartGame}
      />

      {/* Footer Info Guidance */}
      <footer className="w-full mt-10 border-t border-emerald-700/50 pt-6 pb-2 text-center text-[10px] text-emerald-100/70 font-bold uppercase tracking-widest flex flex-col sm:flex-row justify-between items-center gap-4">
        <span>© Prototipe PT Salam Pacific Indonesia Lines (SPIL)</span>
        <div className="flex items-center gap-4 text-emerald-200">
          <span className="flex items-center gap-1 hover:text-white cursor-pointer">
            <Anchor className="w-3.5 h-3.5" /> Ports: SBY - MKS - JYP - MDN
          </span>
          <span className="flex items-center gap-1 hover:text-white cursor-pointer">
            <HelpCircle className="w-3.5 h-3.5" /> Biaya Shifting: Rp 3.000.000 / Move
          </span>
        </div>
      </footer>
    </div>
  );
}
