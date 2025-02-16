import {
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  IsStrongPassword,
  IsBoolean,
  IsObject,
} from 'class-validator';
import { Address } from '../schemas/address.schema';
import { Patient } from '../schemas/patient.schema';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  readonly _id?: string;    
    
  @IsOptional()
  @IsString()
  @MinLength(3)
  readonly name?: string;

  @IsOptional()
  @IsEmail()
  readonly email?: string;

  @IsOptional()
  @IsString()
  @IsStrongPassword()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsString()
  readonly gender?: string;

  @IsOptional()
  @IsString()
  readonly phone?: string;

  @IsOptional()
  readonly date_of_birth?: Date;

  @IsOptional()
  @IsString()
  readonly occupation?: string;

  @IsOptional()
  readonly address?: Address;
  
  @IsOptional()
  @IsBoolean()
  isBlocked?: Boolean;

  @IsOptional()
  @IsString()
  refresh_token?: string;

  @IsOptional()
  @IsObject()
  patients?: Patient[];
}
