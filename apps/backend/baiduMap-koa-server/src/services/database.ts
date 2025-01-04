import Pool from 'pg-pool';
import config from '../config/index.js';
import logger from '../utils/logger.js';

const pool = new Pool({
  connectionString: config.database.url,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export async function connectDatabase() {
  try {
    await pool.connect();
    logger.info('PostgreSQL connected successfully');
  } catch (err) {
    logger.error('PostgreSQL connection error:', err);
    process.exit(1);
  }
}

export async function disconnectDatabase() {
  try {
    await pool.end();
    logger.info('PostgreSQL disconnected successfully');
  } catch (err) {
    logger.error('PostgreSQL disconnection error:', err);
    process.exit(1);
  }
}

export function getPool() {
  return pool;
}
