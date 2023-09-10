import { Inject, Injectable } from '@nestjs/common';
import { PG_CONNECTION } from '../constants';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

@Injectable()
export class DrizzleService {
  constructor(
    @Inject(PG_CONNECTION) private conn: NodePgDatabase<typeof schema>,
  ) {}

  async migrateDatabase() {
    try {
      await migrate(this.conn, { migrationsFolder: 'src/drizzle/migrations' });
    } catch (e) {
      console.log(e);
    }
  }
}
