import { query } from './utils/db.js';

async function show() {
  try {
    console.log('\n=== 📋 STRUKTUR TABEL SESSIONS ===');
    const columns = await query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'sessions'
      ORDER BY ordinal_position;
    `);
    console.table(columns.rows);

    console.log('\n=== 🎮 ISI TABEL SESSIONS (5 Sesi Terakhir) ===');
    const data = await query(`
      SELECT session_id, week, current_port, cash, is_game_over, created_at 
      FROM sessions 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    if (data.rows.length === 0) {
      console.log('(Belum ada data sesi permainan di database. Silakan mulai game di browser Anda terlebih dahulu.)');
    } else {
      console.table(data.rows);
      
      console.log('\n=== 📦 DETAIL GRID & ORDER SESI TERAKHIR ===');
      const detailResult = await query(`
        SELECT session_id, grid, orders 
        FROM sessions 
        ORDER BY created_at DESC 
        LIMIT 1
      `);
      const lastSession = detailResult.rows[0];
      
      // Hitung jumlah kontainer di grid
      const gridObj = typeof lastSession.grid === 'string' ? JSON.parse(lastSession.grid) : lastSession.grid;
      let containerCount = 0;
      Object.keys(gridObj).forEach(bay => {
        Object.keys(gridObj[bay]).forEach(row => {
          Object.keys(gridObj[bay][row]).forEach(tier => {
            if (gridObj[bay][row][tier]) containerCount++;
          });
        });
      });
      
      // Hitung jumlah order
      const ordersArr = typeof lastSession.orders === 'string' ? JSON.parse(lastSession.orders) : lastSession.orders;
      const acceptedOrders = ordersArr.filter(o => o.accepted).length;
      
      console.log(`ID Sesi: ${lastSession.session_id}`);
      console.log(`Jumlah Kontainer Terisi di Grid Kapal: ${containerCount} kontainer`);
      console.log(`Jumlah Order yang Tersedia: ${ordersArr.length} order (${acceptedOrders} diterima)`);
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Gagal menampilkan database:', err.message || err);
    process.exit(1);
  }
}

show();
