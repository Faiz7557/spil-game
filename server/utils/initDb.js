import { query } from './db.js';

/**
 * Membuat tabel 'sessions' jika belum ada di PostgreSQL database
 */
export const initializeDatabase = async () => {
  const createTableSql = `
    CREATE TABLE IF NOT EXISTS sessions (
      session_id VARCHAR(100) PRIMARY KEY,
      week INT NOT NULL DEFAULT 1,
      current_port VARCHAR(10) NOT NULL DEFAULT 'SBY',
      cash BIGINT NOT NULL DEFAULT 150000000,
      accumulated_penalties BIGINT NOT NULL DEFAULT 0,
      is_game_over BOOLEAN NOT NULL DEFAULT FALSE,
      player_rating VARCHAR(100),
      grid JSONB NOT NULL,
      orders JSONB NOT NULL,
      performance_log JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await query(createTableSql);
    console.log('[Database] Tabel `sessions` siap digunakan (berhasil diinisialisasi).');
  } catch (error) {
    console.error('[Database] Kesalahan saat menginisialisasi database:', error.message || error);
  }
};
