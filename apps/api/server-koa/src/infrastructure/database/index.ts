import pg from 'pg';

import { config } from '../../core/config';
import { createLogger } from '../logger';

const logger = createLogger('database');
const { Pool } = pg;

class Database {
  private pool: pg.Pool | null = null;

  /**
   * 连接数据库
   * @returns 数据库连接池
   */
  async connect(): Promise<pg.Pool> {
    if (this.pool) {
      return this.pool;
    }

    this.pool = new Pool({
      connectionString: config.POSTGRES_URI,
      max: config.POSTGRES_MAX,
      idleTimeoutMillis: config.POSTGRES_IDLE_TIMEOUT,
      connectionTimeoutMillis: config.POSTGRES_CONNECTION_TIMEOUT,
    });

    this.pool.on('error', (err) => {
      logger.error('Unexpected database error', { error: err.message });
    });

    this.pool.on('connect', () => {
      logger.info('New database connection established');
    });

    try {
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      logger.info('Database connected successfully');
    } catch (error) {
      logger.error('Failed to connect to database', { error });
      throw error;
    }

    return this.pool;
  }

  /**
   * 获取数据库连接池
   * @returns 数据库连接池
   */
  getPool(): pg.Pool {
    if (!this.pool) {
      throw new Error('Database not initialized. Call connect() first.');
    }
    return this.pool;
  }

  /**
   * 断开数据库连接
   */
  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      logger.info('Database disconnected');
    }
  }

  /**
   * 执行数据库查询
   * @template T 查询结果类型
   * @param text SQL查询文本
   * @param params 查询参数（可选）
   * @returns 查询结果
   */
  async query<T = pg.QueryResult>(text: string, params?: unknown[]): Promise<T> {
    const pool = this.getPool();
    const start = Date.now();
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', { text, duration, rows: result.rowCount });
    return result as T;
  }

  /**
   * 执行数据库事务
   * @template T 事务结果类型
   * @param callback 事务回调函数，接收数据库客户端作为参数
   * @returns 事务结果
   */
  async transaction<T>(callback: (client: pg.PoolClient) => Promise<T>): Promise<T> {
    const pool = this.getPool();
    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

export const database = new Database();
export default database;
