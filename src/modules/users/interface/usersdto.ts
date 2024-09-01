import {
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  IsStrongPassword,
} from 'class-validator';
import { Address } from '../schemas/address.schema';

export class CreateUserDto {
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
}
