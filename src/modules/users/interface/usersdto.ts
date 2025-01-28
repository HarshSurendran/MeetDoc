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

export class CreateUserDto {
  @IsOptional()
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
  
  @IsOptional()
  @IsBoolean()
  isBlocked: Boolean;

  @IsOptional()
  @IsString()
  refresh_token: string;

  @IsOptional()
  @IsObject()
  patients: Patient[];
}
