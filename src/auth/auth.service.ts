import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService, UserWithRole, User } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthLoginDto } from './dto/auth-dto';
import * as fs from 'fs';
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(
    email: string,
    password: string,
  ): Promise<UserWithRole | string> {
    const user: UserWithRole | string = await this.usersService.findOneByEmail(
      email,
    );

    if (typeof user === 'string') {
      // Handle the case where an error message is returned
      throw new BadRequestException(user);
    }

    if (!user) {
      throw new BadRequestException('Something Happened');
    }
    const matches: boolean = await bcrypt.compare(password, user.password_hash);
    if (!matches) {
      throw new BadRequestException('Wrong password');
    }
    return user;
  }

  async signUp(createUser: CreateUserDto): Promise<User[] | string> {
    const existing: UserWithRole | string =
      await this.usersService.findOneByEmail(createUser.email);
    if (typeof existing !== 'string') {
      throw new BadRequestException('auth/account-exists');
    }
    const user = await this.usersService.create(createUser);
    return user;
  }

  async login(user: AuthLoginDto) {
    const users: UserWithRole | string = await this.usersService.findOneByEmail(
      user.email,
    );

    if (typeof users === 'string') {
      // Handle the case where an error message is returned
      throw new BadRequestException(users);
    }
    const payload = {
      username: users.username,
      email: users.email,
      sub: users.id,
      role_id: users?.user_role?.id,
    };

    // return {
    //   access_token: this.jwtService.sign(payload),
    // };
    return this.generateTokens(payload);
  }

  generateTokens(payload): {
    accessToken: string;
    refreshToken: string;
  } {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  private generateAccessToken(payload): string {
    return this.jwtService.sign(payload);
  }

  private generateRefreshToken(payload): string {
    return this.jwtService.sign(payload, {
      secret: fs.readFileSync('./private.pem'),
      expiresIn: '30 days',
    });
  }

  refreshToken(token: string) {
    try {
      const { userId } = this.jwtService.verify(token, {
        secret: fs.readFileSync('./private.pem'),
      });

      return this.generateTokens({
        userId,
      });
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
  // async login(userReq: AuthLoginDto) {
  //   const user: UserWithRole[] | string =
  //     await this.usersService.findOneByEmail(userReq.email);
  //   const payload = {
  //     username: user[0]?.username,
  //     email: user[0]?.email,
  //     sub: user[0]?.id,
  //   };
  //   return {
  //     access_token: this.jwtService.sign(payload),
  //   };
  // }
}
