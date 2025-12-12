import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, ConnectionStates } from 'mongoose';

@Injectable()
export class DbHealthService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  check(): boolean {
    // 1 = connected, 2 = connecting
    return this.connection.readyState === ConnectionStates.connected;
  }
}
