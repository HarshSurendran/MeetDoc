import {
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  IsStrongPassword,
} from 'class-validator';

export class CreateAdminDto {
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
  readonly refresh_token: string;
}
