/**
 * @description MongoDB (Mongoose) 配置
 */
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Connection } from 'mongoose';

export const MongooseConfig = MongooseModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    uri: config.get<string>('MONGO_URI'),
    dbName: config.get<string>('MONGO_DB_ERRORS'),
    connectionFactory: (connection: Connection) => {
      // 性能优化配置
      connection.set('debug', config.get('NODE_ENV') === 'development');
      connection.set('bufferCommands', false);
      connection.set('autoIndex', false);
      return connection;
    },
  }),
});
