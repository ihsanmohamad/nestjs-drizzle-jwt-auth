import { Module } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { PG_CONNECTION } from '../constants';
import * as schema from './schema';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DrizzleService } from './drizzle.service';

@Module({
  providers: [
    {
      provide: PG_CONNECTION,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const connectionString = configService.get<string>('DATABASE_URL');
        const pool = new Pool({
          connectionString,
          ssl: false,
        });

        return drizzle(pool, { schema });
      },
    },
    DrizzleService,
  ],
  imports: [ConfigModule],
  exports: [PG_CONNECTION],
})
export class DrizzleModule {}
