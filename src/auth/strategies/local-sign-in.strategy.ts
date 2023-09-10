import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UserWithRole } from '../../users/users.service';

@Injectable()
export class LocalSignInStrategy extends PassportStrategy(
  Strategy,
  'local-sign-in',
) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }

  async validate(email: string, password: string): Promise<any> {
    const user: UserWithRole | string = await this.authService.signIn(
      email,
      password,
    );
    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
