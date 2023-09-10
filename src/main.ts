import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api', { exclude: ['/'] });
  app.useGlobalPipes(new ValidationPipe());
  const config = new DocumentBuilder()
    .setTitle('Kawteam App')
    .setDescription('Backend service of kawteam app')
    .setVersion('1.0')
    .addTag('auth')
    .addTag('users')
    .addTag('profiles')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (__: string, methodKey: string) => methodKey,
  });
  SwaggerModule.setup('api', app, document);
  await app.listen(3000);
}
bootstrap();
