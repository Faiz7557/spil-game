import express from 'express';
import cors from 'cors';
import {
  PORTS,
  createEmptyGrid,
  generateOrders,
  calculateRestows,
  validateGridPhysics,
  calculateRollingPenalties,
  calculateGrossRevenue,
  processSailingTransition
} from './utils/gameEngine.js';

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());

// In-memory session store (simulating PostgreSQL in-memory schema)
const SESSIONS = {};

const generateSessionId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Log helper
const logState = (sessionId) => {
  const session = SESSIONS[sessionId];
  if (!session) return;
  console.log(`[Session ${sessionId}] Week ${session.week} at ${session.currentPort}. Cash: Rp ${session.cash.toLocaleString()}`);
};

/**
 * Endpoint to start a new game session
 */
app.post('/api/game/start', (req, res) => {
  try {
    const sessionId = generateSessionId();
    const initialPort = 'SBY';
    const initialCash = 150000000; // Rp 150.000.000 approved starting cash
    
    const sessionState = {
      sessionId,
      week: 1,
      currentPort: initialPort,
      cash: initialCash,
      accumulatedPenalties: 0,
      grid: createEmptyGrid(),
      orders: generateOrders(initialPort, 1),
      performanceLog: [], // Weekly performance history
      isGameOver: false,
      playerRating: null
    };
    
    SESSIONS[sessionId] = sessionState;
    console.log(`[Game Started] Session ID: ${sessionId}`);
    logState(sessionId);
    
    res.json({
      success: true,
      data: sessionState
    });
  } catch (error) {
    console.error('Error starting game:', error);
    res.status(500).json({ success: false, message: 'Internal server error starting game.' });
  }
});

/**
 * Endpoint to retrieve current game state
 */
app.get('/api/game/state/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = SESSIONS[sessionId];
  
  if (!session) {
    return res.status(404).json({ success: false, message: 'Sesi permainan tidak ditemukan.' });
  }
  
  res.json({
    success: true,
    data: session
  });
});

/**
 * Endpoint to accept a Sales Call order
 */
app.post('/api/game/accept-order', (req, res) => {
  const { sessionId, orderId } = req.body;
  const session = SESSIONS[sessionId];
  
  if (!session) {
    return res.status(404).json({ success: false, message: 'Sesi permainan tidak ditemukan.' });
  }
  
  const order = session.orders.find(o => o.id === orderId);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan.' });
  }
  
  order.accepted = true;
  console.log(`[Order Accepted] Session: ${sessionId}, Order: ${orderId}`);
  
  res.json({
    success: true,
    data: session
  });
});

/**
 * Endpoint to decline a Non-Committed Sales Call order
 */
app.post('/api/game/decline-order', (req, res) => {
  const { sessionId, orderId } = req.body;
  const session = SESSIONS[sessionId];
  
  if (!session) {
    return res.status(404).json({ success: false, message: 'Sesi permainan tidak ditemukan.' });
  }
  
  const order = session.orders.find(o => o.id === orderId);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan.' });
  }
  
  if (order.customerType === 'Committed') {
    return res.status(400).json({
      success: false,
      message: 'Kontrak prioritas Committed Customer tidak dapat ditolak. Denda berlaku jika tidak dimuat.'
    });
  }
  
  // Remove the order or set it as declined
  session.orders = session.orders.filter(o => o.id !== orderId);
  console.log(`[Order Declined] Session: ${sessionId}, Order: ${orderId}`);
  
  res.json({
    success: true,
    data: session
  });
});

/**
 * Endpoint to depart port (sails to Next Port)
 * Handles physical validation, denda calculation, state transition, and weekly logging.
 */
app.post('/api/game/depart', (req, res) => {
  const { sessionId, grid } = req.body;
  const session = SESSIONS[sessionId];
  
  if (!session) {
    return res.status(404).json({ success: false, message: 'Sesi permainan tidak ditemukan.' });
  }
  
  if (session.isGameOver) {
    return res.status(400).json({ success: false, message: 'Permainan sudah berakhir.' });
  }

  // 1. Vessel Stacking Physics Validation
  const physicsCheck = validateGridPhysics(grid);
  if (!physicsCheck.valid) {
    return res.status(400).json({
      success: false,
      message: 'Pemeriksaan fisika grid gagal. Silakan selesaikan kesalahan penempatan.',
      errors: physicsCheck.errors
    });
  }
  
  // Update grid representation to match what the player submitted
  session.grid = grid;
  
  const currentPort = session.currentPort;
  const currentWeek = session.week;
  const currentPortIndex = PORTS.indexOf(currentPort);
  const nextPort = PORTS[(currentPortIndex + 1) % PORTS.length];
  
  // 2. Compute Restowage Move Count (Shifting Denda)
  const restowCheck = calculateRestows(session.grid, currentPort);
  const restowPenaltyTotal = restowCheck.restowMovementsCount * 3000000; // Rp 3.000.000 per movement
  
  // 3. Compute Rolling Penalties (Gagal Muat)
  const rollingCheck = calculateRollingPenalties(session.orders, session.grid, currentPort);
  
  // 4. Compute Gross Revenue
  const grossRevenue = calculateGrossRevenue(session.grid, currentPort);
  
  // 5. Compute Net Income
  const totalWeeklyPenalties = restowPenaltyTotal + rollingCheck.rollingPenaltyTotal;
  const netIncome = grossRevenue - totalWeeklyPenalties;
  
  // 6. Update financials
  session.cash += netIncome;
  session.accumulatedPenalties += totalWeeklyPenalties;
  
  // 7. Commit to Lembar Kinerja Mingguan (weekly performance log)
  const performanceLogEntry = {
    week: currentWeek,
    port: currentPort,
    rolledCount: rollingCheck.rolledContainersCount,
    rollingPenalty: rollingCheck.rollingPenaltyTotal,
    restowCount: restowCheck.restowContainersCount,
    restowPenalty: restowPenaltyTotal,
    grossRevenue,
    netIncome,
    cashSnapshot: session.cash,
    accumulatedPenaltiesSnapshot: session.accumulatedPenalties,
    rolledDetails: rollingCheck.rolledList,
    restowDetails: restowCheck.restowedList
  };
  
  session.performanceLog.push(performanceLogEntry);
  
  // 8. Unload Next Port containers and execute slide-down support physics
  const transitioningGrid = processSailingTransition(session.grid, nextPort);
  session.grid = transitioningGrid;
  
  // 9. Advance State (Week and Port)
  session.week += 1;
  session.currentPort = nextPort;
  
  // 10. Check Game Over
  if (session.week > 8) {
    session.isGameOver = true;
    
    // Evaluate Player Rating based on final cash balance
    let rating = 'Perwira Logistik Junior';
    if (session.cash >= 300000000) {
      rating = 'VP Operasi Logistik & Stowage';
    } else if (session.cash >= 200000000) {
      rating = 'Spesialis Stowage Pelabuhan Senior';
    } else if (session.cash >= 100000000) {
      rating = 'Koordinator Logistik Standar';
    } else if (session.cash < 0) {
      rating = 'Supervisor Terminal Bangkrut';
    }
    session.playerRating = rating;
    console.log(`[Game Over] Session ${sessionId}. Final Cash: Rp ${session.cash.toLocaleString()}. Rating: ${rating}`);
  } else {
    // Generate new orders for the new current port
    session.orders = generateOrders(session.currentPort, session.week);
  }
  
  console.log(`[Sailing Transition Completed] Session: ${sessionId}, Week ${currentWeek} -> ${session.week}`);
  logState(sessionId);
  
  // Send back both the updated session state AND the result of this week's evaluation for modal review
  res.json({
    success: true,
    data: session,
    weeklyEvaluation: performanceLogEntry
  });
});

// Start listening
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`  SPIL Game Backend running on port ${PORT} `);
  console.log(`===============================================`);
});
