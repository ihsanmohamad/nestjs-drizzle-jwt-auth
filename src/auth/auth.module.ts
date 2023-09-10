import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { LocalSignUpStrategy } from './strategies/local-sign-up.strategy';
import { LocalSignInStrategy } from './strategies/local-sign-in.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthController } from './auth.controller';
import * as fs from 'fs';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      publicKey: fs.readFileSync('./public.pem'), // Path to your public key
      privateKey: fs.readFileSync('./private.pem'), // Path to your private key
      signOptions: { expiresIn: '1 days', algorithm: 'RS256' },
    }),
  ],
  providers: [
    AuthService,
    LocalSignInStrategy,
    LocalSignUpStrategy,
    JwtStrategy,
  ],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
