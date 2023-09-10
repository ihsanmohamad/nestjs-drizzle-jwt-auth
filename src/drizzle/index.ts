import { NestFactory } from '@nestjs/core';
import { DrizzleModule } from './drizzle.module';
import { DrizzleService } from './drizzle.service';
import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config();
  const application = await NestFactory.createApplicationContext(DrizzleModule);

  const command = process.argv[2];

  switch (command) {
    case 'migrate':
      const drizzleService = application.get(DrizzleService);
      await drizzleService.migrateDatabase();
      break;
    default:
      console.log('Command not found');
      process.exit(1);
  }

  await application.close();
  process.exit(0);
}

bootstrap();
