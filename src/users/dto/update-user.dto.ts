// update-user.dto.ts
import { IsEmail, IsOptional, IsNumber } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { ApiProperty } from '@nestjs/swagger';
export class UpdateUserDto extends PartialType(CreateUserDto) {
  // Make the email and role_id properties optional
  @ApiProperty({ default: 'string@test.com' })
  @IsEmail()
  @IsOptional()
  readonly email?: string;

  @ApiProperty()
  @IsOptional()
  readonly username?: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  readonly role_id?: number;
}
