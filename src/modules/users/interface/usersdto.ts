import {
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  IsStrongPassword,
  IsBoolean,
} from 'class-validator';
import { Address } from '../schemas/address.schema';

export class CreateUserDto {
  @IsString()
  readonly _id: string;    
    
  @IsString()
  @MinLength(3)
  readonly name: string;

  @IsEmail()
  readonly email: string;

  @IsString()
  @IsStrongPassword()
  @MinLength(6)
  password: string;

  @IsString()
  readonly gender: string;

  @IsOptional()
  @IsString()
  readonly phone?: string;

  @IsOptional()
  readonly date_of_birth?: Date;

  @IsOptional()
  @IsString()
  readonly occupation: string;

  @IsOptional()
  readonly address: Address;

  @IsBoolean()
  isBlocked: Boolean;

  @IsOptional()
  @IsString()
  refresh_token: string;
}
