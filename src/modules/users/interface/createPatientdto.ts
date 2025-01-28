import { IsDate, IsString } from "class-validator";

export class CreatePatientDto {
    @IsString()
    name: string

    @IsString()
    relation: string

    @IsString()
    dateOfBirth: Date

    @IsString()
    gender: string
}