import { IsString, IsInt, IsEmail, IsBoolean, IsDate, IsArray, IsOptional, IsNotEmpty } from 'class-validator';

export class PersonalDetailsDto {
  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsEmail()
  email: string;

  @IsString()
  gender: string;

  @IsInt()
  age: number;

  @IsArray()
  @IsString({ each: true })
  language: string[];
}

export class EducationDetailsDto {
  @IsString()
  institution: string;

  @IsString()
  degree: string;

  @IsString()
  specialty: string;

  @IsString()
  university: string;

  @IsString()
  registrationNumber: string;

  @IsString()
  city: string;

  @IsInt()
  yearOfCompletion: number;

  @IsOptional()
  @IsString()
  certificateFile?: string; 
}

export class PostGraduationDetailsDto {
  @IsString()
  institution: string;

  @IsString()
  degree: string;

  @IsString()
  specialty: string;

  @IsString()
  superSpecialty: string;

  @IsString()
  university: string;

  @IsString()
  registrationNumber: string;

  @IsString()
  city: string;

  @IsInt()
  yearOfCompletion: number;

  @IsOptional()
  @IsString()
  certificateFile?: string;
}

export class VerificationDetailsDto {
  @IsString()
  specialty: string;

  @IsOptional()
  @IsString()
  proofFile?: string; 
}

export class ExperienceDetailsDto {
  @IsString()
  hospitalName: string;

  @IsString()
  position: string;

  @IsDate()
  from: Date;

  @IsDate()
  to: Date;
}

export class DocVerificationDto {
  @IsNotEmpty()
  personalDetails: PersonalDetailsDto;

  @IsNotEmpty()
  educationDetails: EducationDetailsDto;
  
  postGraduationDetails: PostGraduationDetailsDto;

 
  verificationDetails: VerificationDetailsDto;

  @IsArray()  
  experienceDetails: ExperienceDetailsDto[];

  @IsBoolean()
  acceptedTerms: boolean;

  @IsString()
  doctorId: string; 
}
