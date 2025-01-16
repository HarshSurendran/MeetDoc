import {
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  IsStrongPassword,
  IsBoolean,
  IsArray,
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

  @IsOptional()
  @IsString()
  @MinLength(3)
  readonly name: string;

  @IsOptional()
  @IsEmail()
  readonly email: string;

  @IsOptional()
  @IsString()
  @IsStrongPassword()
  @MinLength(6)
  password: string;

  @IsOptional()
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
  @IsArray()
  @IsString({each: true})
  languages: string[];

  @IsOptional()
  @IsBoolean()
  isVerified: Boolean;

  @IsOptional()
  @IsString()
  refreshToken: string;
}


export class DoctorDto {
  @IsOptional()
  readonly _id: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  readonly name: string;

  @IsOptional()
  @IsEmail()
  readonly email: string;

  @IsOptional()
  @IsString()
  @IsStrongPassword()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  readonly gender: string;

  @IsOptional()
  @IsArray()
  @IsString({each: true})
  languages: string[];

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

  @IsOptional()
  @IsString()
  refreshToken: string;
}