import {
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  IsStrongPassword,
  IsBoolean,
} from 'class-validator';
import { Address } from 'src/modules/users/schemas/address.schema';

export class CreateDoctorDto {
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
  
}


export class UpdateDoctorDto {
  @IsOptional()
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
  readonly qualification: string;

  @IsOptional()
  @IsString()
  degree: string;

  @IsOptional()
  @IsString()
  masterDegree: string;

  @IsOptional()
  readonly address: Address;

  @IsOptional()
  readonly specialisation: string;

  @IsOptional()
  @IsBoolean()
  isVerified: Boolean;
}