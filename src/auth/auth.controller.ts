import { Controller, Post, UseGuards, Req, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthLoginDto } from './dto/auth-dto';
import { JwtRequest } from '../common/decorator/currentUser.decorator';
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard('local-sign-up'))
  @Post('sign-up')
  async signUp(@Body() createUser: CreateUserDto, @Req() req: JwtRequest) {
    const newUser = { ...createUser, id: req.user.id };
    return this.authService.login(newUser);
  }

  @UseGuards(AuthGuard('local-sign-in'))
  @Post('sign-in')
  // async login(@Req() req: Request) {
  //   return this.authService.login(req.user as UserWithRole);
  // }
  async login(@Body() loginCredential: AuthLoginDto) {
    return this.authService.login(loginCredential);
  }
}
