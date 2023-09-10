import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService, UserWithRole, User } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import {
  CurrentUser,
  JwtPayload,
} from '../common/decorator/currentUser.decorator';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiResponse({
    status: 201,
    description: 'User created successfully',
  })
  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<User[] | string> {
    return await this.usersService.create(createUserDto);
  }

  @Get()
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'cursor', required: false, type: String })
  async findAll(
    @Query('limit') limit: number,
    @Query('cursor') cursor: Date,
  ): Promise<UserWithRole[]> {
    if (cursor != undefined) {
      const createdAt = new Date(cursor);
      return await this.usersService.findAll({
        limit,
        cursor: createdAt,
      });
    } else {
      return await this.usersService.findAll({ limit });
    }
  }

  @Get('/email-list')
  getEmailLists(): Promise<string[]> {
    return this.usersService.getEmailOnly();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserWithRole | string> {
    const user: UserWithRole | string = await this.usersService.findOne(id);

    if (typeof user === 'string') {
      // Handle the case where an error message is returned
      throw new BadRequestException(user);
    }

    delete user.password_hash;
    delete user.createdAt;
    delete user.updatedAt;
    return user;
    // return await this.usersService.findOne(+id);
  }

  @Get('/profile-link/:email')
  async findOneByEmail(
    @Param('email') email: string,
  ): Promise<UserWithRole | string> {
    const user: UserWithRole | string = await this.usersService.findOneByEmail(
      email,
    );

    if (typeof user === 'string') {
      // Handle the case where an error message is returned
      throw new BadRequestException(user);
    }
    delete user.password_hash;
    delete user.createdAt;
    delete user.updatedAt;
    return user;
  }

  @ApiBearerAuth()
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() req: JwtPayload,
  ) {
    if (req.id !== id) {
      throw new UnauthorizedException('Unauthorized');
    }
    return this.usersService.update(id, {
      email: updateUserDto.email,
      role_id: updateUserDto.role_id,
    });
  }

  @ApiBearerAuth()
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') id: string, @CurrentUser() req: JwtPayload) {
    if (req.role === 1 || req.id == id) {
      return this.usersService.remove(id);
    } else {
      throw new UnauthorizedException('Unauthorized');
    }
  }
}
