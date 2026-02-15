import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'node:path';

export default (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.PG_HOST,
  port: Number.parseInt(process.env.PG_PORT, 10),
  username: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE_NAME,
  entities: [join(__dirname, '../', '**/**.entity{.ts,.js}')],
  synchronize: true,
  logging: true,
  retryAttempts: 3,
});
